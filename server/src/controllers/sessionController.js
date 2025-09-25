import db from '../db/db.js'
import { google } from 'googleapis';



const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/auth/google/callback" 
);

export const createSession = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const { connectionId, title, objectives, startTime, endTime, format } = req.body;

    // Basic validation
    if (!connectionId || !title || !startTime || !endTime || !format) {
        return res.status(400).json({ message: "Missing required session details." });
    }

    try {
        // Security check: Ensure the logged-in user is part of the connection
        const connectionCheck = await db.query(
            `SELECT id FROM connections WHERE id = $1 AND (mentee_id = $2 OR mentor_id = $2) AND status = 'accepted'`,
            [connectionId, userId]
        );

        if (connectionCheck.rows.length === 0) {
            return res.status(403).json({ message: "You are not part of this connection or it is not active." });
        }
        
        const query = `
            INSERT INTO sessions (connection_id, title, objectives, start_time, end_time, format, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
            RETURNING *;
        `;
        const values = [connectionId, title, objectives, startTime, endTime, format];
        
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating session:", error);
        next(error);
    }
};

export const getSessionsForMonth = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    const userId = req.user.id;
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required." });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const query = `
        SELECT
            s.id,
            s.title,
            s.start_time AS "startTime",
            s.end_time AS "endTime",
            s.status,
            s.format,
            p.first_name || ' ' || p.last_name AS "participantName"
        FROM
            sessions s
        JOIN
            connections c ON s.connection_id = c.id
        JOIN
            profiles p ON p.user_id = (CASE WHEN c.mentor_id = $1 THEN c.mentee_id ELSE c.mentor_id END)
        WHERE
            (c.mentor_id = $1 OR c.mentee_id = $1)
            AND s.start_time >= $2 AND s.start_time < $3
        ORDER BY
            s.start_time;
    `;

    try {
        const result = await db.query(query, [userId, startDate, endDate]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        next(error);
    }
};

export const updateSessionStatus = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { status } = req.body;

    if (status !== 'completed') {
        return res.status(400).json({ message: "Only 'completed' status is allowed." });
    }

    try {
        const securityCheck = await db.query(
            `SELECT s.id FROM sessions s JOIN connections c ON s.connection_id = c.id WHERE s.id = $1 AND (c.mentor_id = $2 OR c.mentee_id = $2)`,
            [sessionId, userId]
        );

        if (securityCheck.rows.length === 0) {
            return res.status(403).json({ message: "You do not have permission to update this session." });
        }

        const query = `UPDATE sessions SET status = $1 WHERE id = $2 RETURNING *;`;
        const result = await db.query(query, [status, sessionId]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating session status:", error);
        next(error);
    }
};

export const createMeetLinkForSession = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const { sessionId } = req.params;

    try {
        // FIX: Fetch the user's tokens from the database, not the session.
        const userResult = await db.query(
            `SELECT access_token, refresh_token FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const { access_token, refresh_token } = userResult.rows[0];

        if (!access_token) {
            return res.status(403).json({ message: "User is not authenticated with Google or permissions are missing." });
        }

        // Set the credentials for this specific API call
        oauth2Client.setCredentials({ 
            access_token: access_token, 
            refresh_token: refresh_token 
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const sessionQuery = `
            SELECT 
                s.title, s.start_time, s.end_time, 
                u.email AS "participantEmail"
            FROM sessions s
            JOIN connections c ON s.connection_id = c.id
            JOIN users u ON u.id = (CASE WHEN c.mentor_id = $1 THEN c.mentee_id ELSE c.mentor_id END)
            WHERE s.id = $2 AND (c.mentor_id = $1 OR c.mentee_id = $1)
        `;
        const sessionResult = await db.query(sessionQuery, [userId, sessionId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: "Session not found." });
        }
        const session = sessionResult.rows[0];
        
        const event = await calendar.events.insert({
            calendarId: 'primary',
            conferenceDataVersion: 1,
            requestBody: {
                summary: session.title,
                start: { dateTime: new Date(session.start_time).toISOString() },
                end: { dateTime: new Date(session.end_time).toISOString() },
                conferenceData: {
                    createRequest: {
                        requestId: `taetir-session-${sessionId}-${Date.now()}`,
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                },
                attendees: [{ email: session.participantEmail }]
            }
        });

        const meetLink = event.data.hangoutLink;

        await db.query(
            `UPDATE sessions SET meet_link = $1 WHERE id = $2`,
            [meetLink, sessionId]
        );
        
        res.status(200).json({ meetLink });

    } catch (error) {
        console.error("Error creating Google Meet link:", error);
        next(error);
    }
};
