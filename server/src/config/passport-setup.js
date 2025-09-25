import express from 'express';
import session from 'express-session';
import passport from 'passport';
import {Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getUserById , createUser , createProfile , getUserByGoogleId, getUserByEmail, UpdateProfile} from '../services/userService.js';
import bcrypt from 'bcrypt'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = 'a_very_secret_key_for_session';

const app = express();

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
 if (user && user.id) {
    done(null, user.id );
  } else {
    done(new Error('Failed to serialize user: User or user ID is missing.'), null);
  }
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id)
    done(null, user); 
  } catch (error) {
    done(error);
  } 
});



passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', 
      scope: ['profile', 'email' , ],
    },
     async (accessToken, refreshToken, profile, done) => {
    
      const googleId = profile.id; 
      const existingUser = await getUserByGoogleId(googleId) ;
      
      if (existingUser) {
        return done(null, existingUser); 
      }

      const newUser = await createUser({
        google_id: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName
      });

      await createProfile({
        user_id: newUser.id,
        first_name: profile.name.givenName,  
        last_name: profile.name.familyName,   
        avatar_url: profile.photos[0].value, 
      });


      return done(null, newUser); 
    }
  )
);

passport.use( new LocalStrategy( {
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    console.log(user.password)
    const isMatch = await bcrypt.compare(password , user.password);
    console.log(isMatch);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);

  } catch (error) {
    return done(error);
  }
}
));

