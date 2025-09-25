import { error } from "console";
import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";





export const createUser = async (userData) => {
    const { username , email , password , google_id} = userData;
    let hashedPassword = 0;
    if (password) {
        hashedPassword = password ;
    }

    const query = ` INSERT INTO users (email, password, google_id , username)
                   VALUES ($1, $2, $3, $4)
                   RETURNING id, email, role , created_at`;

    const values = [email, hashedPassword, google_id, username];

    const user = await db.query(query , values);

    return  user.rows[0] ;
}


export const getUserByEmail = async (email)=> {
    const query = `SELECT * FROM users WHERE email = $1` ;
    const values = [email];

    const result = await db.query(query , values);
    return result.rows[0];
}

export const getUserByGoogleId = async (googleId) => {
    const query = `SELECT * FROM users WHERE google_id = $1`;
    const values = [googleId];

    const result = await db.query(query, values);
    return result.rows[0];
}

export const getUserById = async (id) => {
    const querty =`SELECT * FROM users WHERE id = $1`; 
    const values = [id];
    const result = await db.query(querty, values);
    return result.rows[0];
}

export const updatePassword = async (email, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `UPDATE users SET password = $1 WHERE email = $2`;
    const values = [hashedPassword, email];
    await db.query(query, values);
}





export const chooseRole = async (userId, role) => {
    const query = `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role`;
    const values = [role, userId];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    return result.rows[0];
}

export const CreateProfile = async (userId) => {

    const query = `INSERT INTO profiles (user_id)
                   VALUES ($1)
                   RETURNING id, user_id`;

    const values = [userId];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const createProfile = async (profileData) => {
  // Destructure the properties from the single object argument.
  // Provide default values (null) for all optional fields.
  const {
    user_id,
    first_name = null,
    last_name = null,
    avatar_url = null,

  } = profileData;

  // Ensure the most important piece of data is present.
  if (!user_id) {
    throw new Error("Cannot create a profile without a user_id.");
  }

  const query = `
    INSERT INTO profiles (
      user_id, first_name, last_name, avatar_url
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    user_id,
    first_name,
    last_name,
    avatar_url
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Database error in CreateProfile:", error);
    throw new Error("Could not create profile.");
  }
};


export const getProfileByUserId = async (userId) => {
    const query = `SELECT * FROM profiles WHERE user_id = $1`;
    const values = [userId];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const UpdateProfile = async (userId, profileData) => {

   if (!profileData) {
        console.log(`UpdateProfile called for user ${userId} with no data. Skipping update.`);
        // You might want to return the existing profile or simply return null.
        // Returning null is safe and indicates no update was performed.
        return null; 
    }

    const fields = Object.keys(profileData);
    
    if (fields.length === 0) {
        // This handles the case where an empty object {} is passed.
        return null;
    }
    // Use map to create an array of "column = $N" strings for the SET clause.
    // e.g., ["first_name = $1", "bio = $2"]
    const setClause = fields
        .map((field, index) => `"${field}" = $${index + 1}`)
        .join(', ');


    const values = [...Object.values(profileData), userId];

    // Construct the final dynamic query.
    const query = `
        UPDATE profiles 
        SET ${setClause} 
        WHERE user_id = $${values.length} 
        RETURNING *;
    `;
    
    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error("Could not update profile.");
    }
};

export const getRoleProfileByProfileId = async (profileId, role) => {
  let query;
  
  // Determine which table to query based on the role
  if (role === 'mentor') {
    query = `SELECT * FROM mentor_profiles WHERE profile_id = $1`;
  } else if (role === 'mentee') {
    query = `SELECT * FROM mentee_profiles WHERE profile_id = $1`;
  } else {
    // If the role is invalid or not set, we can't fetch anything
    return null;
  }

  try {
    const result = await db.query(query, [profileId]);
    return result.rows[0] || null; // Return the found profile or null
  } catch (error) {
    console.error(`Error fetching ${role} profile:`, error);
    throw new Error(`Could not fetch ${role} profile.`);
  }
};