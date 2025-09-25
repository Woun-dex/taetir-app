import { CreateProfile , getProfileByUserId , UpdateProfile} from "../services/userService.js";
import db from '../db/db.js'


export const createUserProfile = async (req, res) => {
    try {
        const profileData = req.body ;
        const newProfile = await CreateProfile(profileData);
        return res.status(201).json({ message: "Profile created successfully", profile: newProfile });
    } catch (error) {
        console.error("Error creating user profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming user ID is stored in req.locals by the protect middleware
        const profile = await getProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        return res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const profile = await getProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        return res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching my profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const updatedProfile = await UpdateProfile(userId, req.body);
        return res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}   

export const completeProfileSetup = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;
    const { role, profileData, roleSpecificData } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Update the 'users' table with the chosen role
        await client.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
        
        
        const profileFields = Object.keys(profileData).filter(key => profileData[key] && profileData[key].length > 0);
        if (profileFields.length > 0) {
            const setClause = profileFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
            const profileValues = profileFields.map(field => profileData[field]);
            await client.query(
                `UPDATE profiles SET ${setClause} WHERE user_id = $${profileValues.length + 1}`,
                [...profileValues, userId]
            );
        }

        // 3. Create an entry in the role-specific table
        const profileRes = await client.query(`SELECT id FROM profiles WHERE user_id = $1`, [userId]);
        const profileId = profileRes.rows[0].id;

        if (role === 'mentor') {
            const { professional_experience, company, skills } = roleSpecificData;
            await client.query(
                `INSERT INTO mentor_profiles (profile_id, professional_experience, company, skills) VALUES ($1, $2, $3, $4)`,
                [profileId, professional_experience, company, skills]
            );
        } else if (role === 'mentee') {
            const { learning_objectives, experience_level, mentoring_preferences } = roleSpecificData;
            await client.query(
                `INSERT INTO mentee_profiles (profile_id, learning_objectives, experience_level, mentoring_preferences) VALUES ($1, $2, $3, $4)`,
                [profileId, learning_objectives, experience_level, mentoring_preferences]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "Profile completed successfully." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error completing profile setup:", error);
        next(error);
    } finally {
        client.release();
    }
};

const uploadToCloudStorage = async (fileBuffer) => {
    console.log("Simulating upload to cloud storage...");
    return `https://cloud-storage.com/path/to/${Date.now()}.jpg`;
};


export const updateProfileController = async (req, res, next) => {
    if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({ message: "Not authenticated or role not set" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const { profileData, roleSpecificData } = req.body;

    // --- FIX APPLIED HERE ---
    // Provide a default empty JSON string ('{}') if the fields are missing from the request.
    // This prevents the JSON.parse(undefined) error.
    const parsedProfileData = JSON.parse(profileData || '{}');
    const parsedRoleSpecificData = JSON.parse(roleSpecificData || '{}');

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // --- Handle Avatar Upload ---
        if (req.file) {
            // If a new file was uploaded, its Cloudinary URL is in req.file.path
            parsedProfileData.avatar_url = req.file.path;
        }

        // --- Update 'profiles' Table Dynamically ---
        const profileFields = Object.keys(parsedProfileData).filter(key => parsedProfileData[key] != null);
        if (profileFields.length > 0) {
            const setClause = profileFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
            const profileValues = profileFields.map(field => parsedProfileData[field]);
            await client.query(
                `UPDATE profiles SET ${setClause} WHERE user_id = $${profileValues.length + 1}`,
                [...profileValues, userId]
            );
        }

        // --- Update Role-Specific Table Dynamically ---
        const roleSpecificFields = Object.keys(parsedRoleSpecificData).filter(key => parsedRoleSpecificData[key] != null);
        if (roleSpecificFields.length > 0) {
            const profileRes = await client.query(`SELECT id FROM profiles WHERE user_id = $1`, [userId]);
            const profileId = profileRes.rows[0].id;
            
            const tableName = userRole === 'mentor' ? 'mentor_profiles' : 'mentee_profiles';
            
            const setClause = roleSpecificFields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
            const roleValues = roleSpecificFields.map(field => parsedRoleSpecificData[field]);
            
            await client.query(
                `UPDATE ${tableName} SET ${setClause} WHERE profile_id = $${roleValues.length + 1}`,
                [...roleValues, profileId]
            );
        }
        
        await client.query('COMMIT');
        res.status(200).json({ message: "Profile updated successfully." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating profile:", error);
        next(error);
    } finally {
        client.release();
    }
};

