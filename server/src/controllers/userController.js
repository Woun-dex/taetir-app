import {createUser  , getUserByEmail , getUserById , updatePassword , chooseRole , CreateProfile , UpdateProfile , getProfileByUserId} from "../services/userService.js";

import { sendOTPEmail } from "../services/nodemail.js";
import { StoreOTP , VerifyOTP } from "../services/RedisOTP.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


export const signupController = async (req, res, next) => {
  const { username, email, password } = req.body;


  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {

    const existingUser = await getUserByEmail(email) ;
    if (existingUser) {
      return res.status(409).json({ message: 'Email or username is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({ username, email, password: hashedPassword });
    await CreateProfile( newUser.id );
    const Profile = await getProfileByUserId(newUser.id);

    const User = newUser;
    console.log("User created successfully:", User);

  
    req.logIn(User, (err) => {

      if (err) {
        return next(err);
      }
      return res.status(201).json({ user:User , profile: Profile });
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return next(error); 
  }
};

export const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}




export const ChangePassword  = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: "Email and new password are required" });
        }
        await updatePassword(email, newPassword);
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch ( error){
        console.error("Error updating password:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export const getUser = async ( req , res ) => {
    try {
        const { id } = req.user.id ;
        if ( !id ) {
            return res.status(400).json({error : "Error Fetching User"})
        }

        const result = await getUserById(id);

        return res.status(201).json({message: "Fetching user successfuly ", user: result});
    }
    catch (error){
        console.error("Error fetching user:", error);
        return res.status(500).json({error : " Internal server error"});
    }
}

export const getUserbyId = async (req , res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await getUserById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}

export const refreshToken = async (req, res) => {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const newToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Token refreshed successfully", token: newToken });
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
}

function generateOTP() {

  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); 
}

export const sendOTP = async (req, res) => {

    try{
        const { email} = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const otp = generateOTP();
        await sendOTPEmail(email, otp);
        const isStored = await StoreOTP(email, otp);
        if (!isStored) {
            return res.status(500).json({ error: "Failed to store OTP" });
        }
        return res.status(200).json({ message: "OTP sent successfully" });

        
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ error: "Failed to send OTP email" });
    }
}

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: " OTP are required" });
        }

        const isVerified = await VerifyOTP(email, otp);
        if (!isVerified) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        const token = generateToken(email);
        return res.status(200).json({ message: "OTP verified successfully", token });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ error: "Failed to verify OTP" });
    }
}


export const UpdateRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ error: "User ID and role are required" });
        }

        const updatedUser = await chooseRole(userId, role);
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const profile = await UpdateProfile(userId, { role });
        
        return res.status(200).json({ message: "Role updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
