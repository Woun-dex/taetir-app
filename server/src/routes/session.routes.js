import express from 'express';
import { createSession, getSessionsForMonth ,updateSessionStatus , createMeetLinkForSession} from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/', getSessionsForMonth);
router.put('/:sessionId/status', updateSessionStatus);
router.post('/:sessionId/meetLink', createMeetLinkForSession);


export default router;