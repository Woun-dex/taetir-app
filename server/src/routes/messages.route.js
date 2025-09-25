import express from 'express';
import { getConversations , getMessagesForConversation , sendMessage} from '../controllers/messageController.js'

const router = express.Router();

router.get('/', getConversations);
router.get('/:connectionId/messages' , getMessagesForConversation);
router.post('/message',sendMessage);





export default router;