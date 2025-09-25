import db from "../db/db.js"


export const getFeedbacks = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const { filter = 'all' } = req.query; // 'all', 'given', or 'received'

    let query = `
        SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at AS "date",
            s.title AS "sessionTitle",
            -- Determine if the feedback was given or received
            CASE
                WHEN r.reviewer_id = $1 THEN 'given'
                ELSE 'received'
            END AS type,
            -- Get the other person's details
            p.first_name || ' ' || p.last_name AS "participantName",
            p.avatar_url AS "participantAvatar"
        FROM
            reviews r
        JOIN
            sessions s ON r.session_id = s.id
        JOIN
            -- This join finds the profile of the OTHER person in the review
            profiles p ON p.user_id = (CASE WHEN r.reviewer_id = $1 THEN r.reviewee_id ELSE r.reviewer_id END)
        WHERE
    `;

    const values = [userId];

    // Add filtering logic based on the query parameter
    if (filter === 'given') {
        query += ` r.reviewer_id = $1`;
    } else if (filter === 'received') {
        query += ` r.reviewee_id = $1`;
    } else { // 'all'
        query += ` (r.reviewer_id = $1 OR r.reviewee_id = $1)`;
    }

    query += ` ORDER BY r.created_at DESC;`;

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        next(error);
    }
};

export const createReview = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const reviewerId = req.user.id;
    const { sessionId, rating, comment } = req.body;

    // Basic validation
    if (!sessionId || !rating) {
        return res.status(400).json({ message: "Session ID and rating are required." });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Security Check: Verify the session and user's participation
        const sessionQuery = `
            SELECT c.mentor_id, c.mentee_id
            FROM sessions s
            JOIN connections c ON s.connection_id = c.id
            WHERE s.id = $1 AND s.status = 'completed' AND (c.mentor_id = $2 OR c.mentee_id = $2);
        `;
        const sessionResult = await client.query(sessionQuery, [sessionId, reviewerId]);

        if (sessionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: "You cannot review this session. It may not be completed or you were not a participant." });
        }

        // 2. FIX: Check if THIS USER has already reviewed THIS session
        const existingReview = await client.query(
            `SELECT id FROM reviews WHERE session_id = $1 AND reviewer_id = $2`,
            [sessionId, reviewerId]
        );
        if (existingReview.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: "You have already submitted a review for this session." });
        }

        // 3. Determine who the reviewee is (the other person in the session)
        const { mentor_id, mentee_id } = sessionResult.rows[0];
        const revieweeId = reviewerId === mentor_id ? mentee_id : mentor_id;

        // 4. Insert the new review into the database
        const insertQuery = `
            INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(insertQuery, [sessionId, reviewerId, revieweeId, rating, comment]);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating review:", error);
        next(error);
    } finally {
        client.release();
    }
};
