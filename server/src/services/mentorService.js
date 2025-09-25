import db from '../db/db.js';
import { getProfileByUserId } from './userService.js';

export const createMentor = async (mentorData) => {
    const { profile_id , professional_experience , specializations,availability } = mentorData;
    const query = `INSERT INTO mentor_profiles (profile_id , professional_experience , specializations, availability)
                   VALUES ($1, $2, $3, $4)
                   RETURNING id, profile_id, professional_experience, specializations, availability`;
    const values = [profile_id, professional_experience, specializations, availability];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const getMentorById = async (id) => {
    const query = `SELECT * FROM mentor_profiles WHERE id = $1`;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const getMentorStats = async (id) => {
    const mentorId = id;
    const query = `SELECT COUNT(*) AS total_connection,                     
                   FROM connections 
                   WHERE mentor_id = $1 and status = 'accepted'`;
    const values = [mentorId];
    const total_connection = await db.query(query, values);
    const query2 = `SELECT COUNT(*) AS total_sessions  FROM sessions 
                    LEFT JOIN connections ON sessions.connection_id = connections.id 
                    WHERE connections.mentor_id = $1 and connections.status = 'accepted'`;
    const total_sessions = await db.query(query2, values);
    const unread_messages = await db.query(`SELECT COUNT(*) AS unread_messages FROM messages 
                                            LEFT JOIN connections ON messages.connection_id = connections.id 
                                            WHERE connections.mentor_id = $1 AND messages.is_read = false`, values);

    return {
        total_connection: total_connection.rows[0].total_connection,
        total_sessions: total_sessions.rows[0].total_sessions,
        unread_messages: unread_messages.rows[0].unread_messages
    };
}

export const getConnectionsByMentorId = async (id) => {
    const mentorId = id;
    const query = ` SELECT id , mentor_id, mentee_id, status, created_at FROM connections WHERE mentor_id = $1`;
    const values = [mentorId];
    const result = await db.query(query, values);
    const connections = result.rows.map(connection => ({
        ...connection,
        mentee: getProfileByUserId(connection.mentee_id)
    }));
    return connections;
}


export const getSchedualedSessions = async (id) => {
    const mentorId = id;
    const query = `SELECT sessions.id, sessions.start_time, sessions.end_time, 
                          connections.mentee_id, connections.status 
                   FROM sessions 
                   JOIN connections ON sessions.connection_id = connections.id 
                   WHERE connections.mentor_id = $1 AND connections.status = 'scheduled'`;
    const values = [mentorId];
    const result = await db.query(query, values);
    const sessions = result.rows.map(session => ({
        ...session,
        mentee: getProfileByUserId(session.mentee_id)
    }));
    return sessions;
}

export const giveReview = async (reviewData) => {
    const mentorId = reviewData.mentor_id;
    const { mentee_id , rating , comment , session_id , skill_evaluation } = reviewData;
    const query = `INSERT INTO reviews (reviewer_id , reviewee_id, rating, comment, session_id, skill_evaluation)
                   VALUES ($1, $2, $3, $4, $5, $6)
                   RETURNING id, reviewer_id, reviewee_id, rating, comment, session_id, skill_evaluation` ;
    const values = [mentee_id, mentorId, rating, comment, session_id, skill_evaluation];
    const result = await db.query(query, values);
    return result.rows[0];
}