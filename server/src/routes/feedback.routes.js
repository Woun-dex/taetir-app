import express from 'express';
import {createReview, getFeedbacks } from '../controllers/feedbackController.js';

const router = express.Router();


router.get('/', getFeedbacks);
router.post('/reviews', createReview);


export default router;