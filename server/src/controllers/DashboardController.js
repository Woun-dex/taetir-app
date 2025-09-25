import db from "../db/db.js"


export const getDashboardStats = async (req, res, next) => {
  // Ensure a user is logged in to fetch their stats
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = req.user.id;
  const userRole = req.user.role; // 'mentor' or 'mentee'

  try {
    // We'll run all our queries in parallel for better performance
    const [
      connectionsResult,
      sessionsResult,
      ratingResult
    ] = await Promise.all([
      // Query 1: Get the count of active connections
      db.query(
        `SELECT COUNT(*) FROM connections WHERE (mentor_id = $1 OR mentee_id = $1) AND status = 'accepted'`,
        [userId]
      ),
      // Query 2: Get the count of sessions completed this month
      db.query(
        `SELECT COUNT(*) FROM sessions s JOIN connections c ON s.connection_id = c.id WHERE (c.mentor_id = $1 OR c.mentee_id = $1) AND s.status = 'completed' AND s.start_time >= date_trunc('month', current_date)`,
        [userId]
      ),
      // Query 3: Get the average rating from reviews
      db.query(
        `SELECT AVG(rating) as average_rating FROM reviews WHERE reviewee_id = $1`,
        [userId]
      )
    ]);

    // Extract the numbers from the query results
    const activeConnections = parseInt(connectionsResult.rows[0].count, 10);
    const sessionsThisMonth = parseInt(sessionsResult.rows[0].count, 10);
    // Coalesce ensures that if there are no ratings, we default to 0 instead of null
    const averageRating = parseFloat(ratingResult.rows[0].average_rating || 0).toFixed(1);

    // Construct the final JSON response object
    const stats = {
      activeConnections,
      sessionsThisMonth,
      averageRating: parseFloat(averageRating),
      connectionChangePercent: 0,
      sessionChangePercent: 0,
      ratingChange: 0
    };

    res.status(200).json(stats);
   
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    next(error); // Pass the error to your global error handler
  }
};

export const getNextSession = async ( req , res ,next) => {
  if (!req.user || !req.user.id){
    return res.status(401).json({message : 'Not Authenticated'})
  }

  const userId = res.user.id ;
  const userRole = res.user.role;

    const query = `
    SELECT 
    s.id ,
    s.title ,
    s.start_time as "startTime" ,
    p.first_name ,
    p.last_name ,
    p.avatar_url 
    from sessions s 
    JOIN connections c ON s.connection_id = c.id 
    JOIN profiles p ON p.user_id = (CASE WHEN c.mentor_id = $1 Then c.mentee_id ELSE c.mentor_id end )
    WHERE 
      ( c.mentor_id = $1 or c.mentee_id = $1)
      AND s.status = 'scheduled'
      AND s.start_time > NOW()
    ORDER BY 
      s.start_time ASC
    LIMIT 1 ;
    `;

  try {

    const result = await db.query(query,[userId]) 

    if (result.rows.length() === 0 ){
      return res.status(201).send()
    }

    const sessions = result.rows[0];

    const responseData = {
      id : sessions.id ,
      title : sessions.title,
      startTime : sessions.startTime ,
      withUser :{
          name : `${session.first_name || ''} ${session.last_name || ''}`.trim(),
          avatar_url : sessions.avatar_url
      }
    }

    res.status(200).json(responseData);

  }catch (error){
    console.error({message : "error fetching next sessions"})
    next(error);
  }
};

export const getRecentActivities = async ( req , res ,next) => {

  if (!req.user || !req.user.id){
    return res.status(401).json({message : 'Not Authenticated'})
  }

  const userId = req.user.id ;

  const limit = parseInt(req.query.limit, 10) || 5;

  const query = `
  SELECT * FROM (

        (SELECT
            'review' AS type,
            r.id,
            r.created_at AS "timestamp",
            json_build_object(
                'name', p.first_name || ' ' || p.last_name,
                'avatar_url', p.avatar_url
            ) AS actor,
            json_build_object('rating', r.rating) AS details
        FROM reviews r
        JOIN profiles p ON r.reviewer_id = p.user_id
        WHERE r.reviewee_id = $1)

        UNION ALL 

        (SELECT
            'session' AS type,
            s.id,
            s.updated_at AS "timestamp",
            json_build_object(
                'name', p.first_name || ' ' || p.last_name,
                'avatar_url', p.avatar_url
            ) AS actor,
            json_build_object('status', s.status, 'title', s.title) AS details
        FROM sessions s
        JOIN connections c ON s.connection_id = c.id
        -- This join finds the profile of the OTHER user in the connection
        JOIN profiles p ON p.user_id = (CASE WHEN c.mentor_id = $1 THEN c.mentee_id ELSE c.mentor_id END)
        WHERE (c.mentor_id = $1 OR c.mentee_id = $1) AND s.status != 'scheduled')


        UNION ALL 

        (SELECT
            'message' AS type,
            m.id,
            m.created_at AS "timestamp",
            json_build_object(
                'name', p.first_name || ' ' || p.last_name,
                'avatar_url', p.avatar_url
            ) AS actor,
            json_build_object('isRead', m.is_read) AS details
        FROM messages m
        JOIN profiles p ON m.sender_id = p.user_id
        JOIN connections c ON m.connection_id = c.id
        WHERE (c.mentor_id = $1 OR c.mentee_id = $1) AND m.sender_id != $1 AND m.is_read = false)
    ) AS activities
    ORDER BY 
        "timestamp" DESC
    LIMIT $2 ;
  `;

  try {
    const result = await db.query(query, [userId, limit]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    next(error);
  }



}

export const getActivityChartData = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const userId = req.user.id;

 
  const query = `
    SELECT
        to_char(days.day, 'Dy') AS day,
        COUNT(sessions.id) AS value
    FROM
        generate_series(
            current_date - interval '6 days',
            current_date,
            '1 day'
        ) AS days(day)
    LEFT JOIN
        sessions ON date_trunc('day', sessions.created_at at time zone 'utc') = days.day
    LEFT JOIN
        connections ON sessions.connection_id = connections.id AND (connections.mentor_id = $1 OR connections.mentee_id = $1)
    GROUP BY
        days.day
    ORDER BY
        days.day;
  `;

  try {
    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching activity chart data:", error);
    next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = req.user.id;

    const query = `
        SELECT COUNT(*)
        FROM messages m
        JOIN connections c ON m.connection_id = c.id
        WHERE
            (c.mentor_id = $1 OR c.mentee_id = $1)
            AND m.sender_id != $1
            AND m.is_read = false;
    `;

    try {
        const result = await db.query(query, [userId]);
        res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error("Error fetching notification count:", error);
        next(error);
    }
};

