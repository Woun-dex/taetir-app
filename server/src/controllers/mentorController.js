import { createMentor , getMentorById } from "../services/mentorService.js";
import { getProfileByUserId } from "../services/userService.js";


import db from '../db/db.js'


export const createMentorProfile = async (req, res) => {
    try {
        const mentorData = req.body;
        const newMentor = await createMentor(mentorData);
        return res.status(201).json({ message: "Mentor profile created successfully", mentor: newMentor });
    } catch (error) {
        console.error("Error creating mentor profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getMentorProfile = async (req, res) => {
    try {
        const mentorId = req.params.id;
        const mentor = await getMentorById(mentorId);
        if (!mentor) {
            return res.status(404).json({ error: "Mentor not found" });
        }
        const profile = await getProfileByUserId(mentor.userId);
        return res.status(200).json({ profile, mentor });
    } catch (error) {
        console.error("Error fetching mentor profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}




export const findMentorsController = async (req, res, next) => {

  const { search = '', skill = '' } = req.query;

  let query = `
    SELECT
        u.id,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.bio,
        p.title,
        mp.company,
        mp.skills,
        mp.availability,
        -- You would need to calculate these fields, e.g., from the 'reviews' table
        4.8 AS rating, -- Placeholder
        23 AS "reviewCount" -- Placeholder
    FROM
        users u
    JOIN
        profiles p ON u.id = p.user_id
    JOIN
        mentor_profiles mp ON p.id = mp.profile_id
    WHERE
        u.role = 'mentor'
  `;

  const values = [];
  let paramIndex = 1;

 
  if (search) {
    query += ` AND (p.first_name ILIKE $${paramIndex} OR p.last_name ILIKE $${paramIndex} OR p.title ILIKE $${paramIndex} OR mp.company ILIKE $${paramIndex})`;
    values.push(`%${search}%`);
    paramIndex++;
  }


  if (skill && skill !== 'All Skills') {

    query += ` AND mp.skills @> $${paramIndex}::text[]`;
    values.push([skill]);
    paramIndex++;
  }
  
  query += ` ORDER BY p.first_name;`;

  try {
    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    next(error);
  }
};


