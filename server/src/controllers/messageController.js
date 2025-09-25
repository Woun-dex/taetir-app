import db from '../db/db.js' 

export const getConversations = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const userId = req.user.id;
    
    // This query is similar to getMyConnections but simplified for the conversation list
    const query = `
        SELECT
            c.id AS "connectionId",
            u.id AS "participantId",
            p.first_name || ' ' || p.last_name AS "participantName",
            p.avatar_url AS "participantAvatar",
            -- Get the last message in the conversation
            (SELECT content FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) AS "lastMessage",
            (SELECT created_at FROM messages WHERE connection_id = c.id ORDER BY created_at DESC LIMIT 1) AS "timestamp",
            -- Count unread messages
            (SELECT COUNT(*) FROM messages WHERE connection_id = c.id AND is_read = false AND sender_id != $1) AS "unreadCount"
        FROM connections c
        JOIN users u ON u.id = (CASE WHEN c.mentor_id = $1 THEN c.mentee_id ELSE c.mentor_id END)
        JOIN profiles p ON u.id = p.user_id
        WHERE (c.mentor_id = $1 OR c.mentee_id = $1) AND c.status = 'accepted'
        ORDER BY "timestamp" DESC NULLS LAST;
    `;
    try {
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) { next(error); }
};

export const getMessagesForConversation = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const userId = req.user.id;
    const { connectionId } = req.params;

    const client = await db.connect(); // Use a transaction

    try {
        await client.query('BEGIN');

        // Security check: Ensure the logged-in user is part of this connection
        const securityCheck = await client.query(
            `SELECT 1 FROM connections WHERE id = $1 AND (mentor_id = $2 OR mentee_id = $2)`,
            [connectionId, userId]
        );
        if (securityCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You do not have permission to view these messages.' });
        }

        // Step 1: Fetch all messages for the conversation
        const messagesQuery = `
            SELECT
                m.id,
                m.content,
                m.created_at AS "timestamp",
                m.sender_id AS "senderId",
                p.first_name || ' ' || p.last_name AS "senderName",
                p.avatar_url AS "senderAvatar"
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE m.connection_id = $1
            ORDER BY m.created_at ASC;
        `;
        const messagesResult = await client.query(messagesQuery, [connectionId]);

        // Step 2: Mark all messages in this conversation that were not sent by the current user as read.
        const updateQuery = `
            UPDATE messages
            SET is_read = true
            WHERE connection_id = $1 AND sender_id != $2 AND is_read = false;
        `;
        await client.query(updateQuery, [connectionId, userId]);

        await client.query('COMMIT');
        
        res.status(200).json(messagesResult.rows);

    } catch (error) { 
        await client.query('ROLLBACK');
        next(error); 
    } finally {
        client.release();
    }
};

export const sendMessage = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const senderId = req.user.id;
    const { connectionId, content } = req.body;

    const query = `
        INSERT INTO messages (connection_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *;
    `;
    try {
        const result = await db.query(query, [connectionId, senderId, content]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
};