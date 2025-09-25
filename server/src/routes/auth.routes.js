import express from "express";

const router = express.Router();

import { signupController  , ChangePassword , refreshToken , verifyOTP , getUser} from "../controllers/userController.js";
import { getProfileByUserId  , getRoleProfileByProfileId} from "../services/userService.js";
import { protect } from "../middleware/protect.js";
import { sendOTP } from "../controllers/userController.js"
import passport from "passport";


router.post("/signup", signupController);

router.post("/send-otp", sendOTP);
router.post("/change-password", ChangePassword);
router.post("/verify-otp",  verifyOTP);

router.post('/login' , (req, res, next) => {
    passport.authenticate('local'  , (err , user , info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log('DEBUG: User not found in database.');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('DEBUG: User found in database:', user.email);
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }
            const profile = await getProfileByUserId(user.id);
            return res.status(200).json({ message: 'Login successful', user, profile });
        });
    })(req, res, next);
});

router.get('/current_user', async (req, res, next) => {
  // 1. Check if a user is logged in via the session
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = req.user;

    // 2. Fetch the main profile associated with the user
    const profile = await getProfileByUserId(user.id);

    let roleProfile = null;
    // 3. If a role and profile exist, fetch the role-specific data
    if (user.role && profile) {
      // This service function will check the role and query the correct table
      roleProfile = await getRoleProfileByProfileId(profile.id, user.role);
    }
    
    // 4. Send back a complete user object to the frontend
    res.status(200).json({ user, profile, roleProfile });

  } catch (error) {
    console.error("Error fetching current user data:", error);
    next(error); // Pass to your global error handler
  }
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

export default router;
