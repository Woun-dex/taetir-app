import express, { json } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import UsersRoutes from './routes/users.routes.js';
import {swaggerSpec} from './docs/swagger.js';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';
import session from 'express-session';
import profileRoutes from './routes/profile.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import app2 from './routes/oauth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import converstionRoutes from './routes/messages.route.js';
import sessionsRoutes from './routes/session.routes.js'
import feedbackRoutes from './routes/feedback.routes.js'

import './config/passport-setup.js'; 



const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}))
app.use(cors({
    origin: process.env.CLIENT_URL,    
    methods: ['GET', 'POST', 'PUT', 'DELETE'] ,
    credentials: true 

}));

app.use(passport.initialize());
app.use(passport.session());




app.use(json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/users', UsersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api', app2);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/conversations', converstionRoutes);
app.use('/api/sessions' , sessionsRoutes);
app.use('/api/feedbacks', feedbackRoutes);


export default app;
