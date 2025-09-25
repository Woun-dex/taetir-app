import express from 'express';
import session from 'express-session';
import '../config/passport-setup.js'; 
import { getProfileByUserId } from '../services/userService.js';

import passport from 'passport';
import cors from 'cors';

const app = express();


app.get(
  '/auth/google',
  passport.authenticate('google') 
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failure', 
  }),
  (req, res) => {
      
    if (req.user.role === null) {
      
      res.redirect('http://localhost:5173/choose-role'); 
    } else {
      res.redirect('http://localhost:5173/dashboard');
    }
  }
);




export default app;