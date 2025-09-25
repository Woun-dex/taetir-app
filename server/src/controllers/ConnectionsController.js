import db from '../db/db.js'


export const getMyConnections = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = req.user.id;

const query = `
    SELECT
        c.id,
        c.status,
        
        CASE
            WHEN c.mentor_id = $1 THEN 'mentee'
            ELSE 'mentor'
        END AS role,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.title,
        
        (SELECT COUNT(*) FROM sessions s WHERE s.connection_id = c.id AND s.status = 'completed') AS "sessionsCount",
        CASE
            WHEN c.status = 'pending' AND c.mentee_id = $1 THEN 'requested'
            WHEN c.status = 'pending' AND c.mentor_id = $1 THEN 'pending'
            ELSE c.status::text -- <-- FIX APPLIED HERE
        END AS "detailedStatus"
    FROM
        connections c
    JOIN
        users u ON u.id = (CASE WHEN c.mentor_id = $1 THEN c.mentee_id ELSE c.mentor_id END)
    JOIN
        profiles p ON u.id = p.user_id
    WHERE
        c.mentor_id = $1 OR c.mentee_id = $1;
  `;

  try {
    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching connections:", error);
    next(error);
  }
};



export const createConnectionRequest = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const menteeId = req.user.id;
    const { mentorId, message } = req.body;

    if (!mentorId) {
        return res.status(400).json({ message: 'Mentor ID is required.' });
    }

    try {
        
        const existingConnection = await db.query(
            `SELECT id FROM connections WHERE (mentor_id = $1 AND mentee_id = $2) OR (mentor_id = $2 AND mentee_id = $1)`,
            [mentorId, menteeId]
        );

        if (existingConnection.rows.length > 0) {
            return res.status(409).json({ message: 'A connection or request already exists.' });
        }

        const query = `
            INSERT INTO connections (mentor_id, mentee_id, request_message, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *;
        `;
        const result = await db.query(query, [mentorId, menteeId, message]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating connection request:", error);
        next(error);
    }
};


export const updateConnectionStatus = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = req.user.id;
  const { connectionId } = req.params; 
  const { status } = req.body; 

  if (!['accepted', 'refused'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided.' });
  }

  try {
 
    const query = `
      UPDATE connections
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND mentor_id = $3 AND status = 'pending'
      RETURNING *;
    `;

    const result = await db.query(query, [status, connectionId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pending connection not found or you do not have permission to modify it.' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error updating connection status:", error);
    next(error);
  }
};