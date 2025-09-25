import express from 'express';
import { getMyConnections , updateConnectionStatus , createConnectionRequest  } from '../controllers/ConnectionsController.js';

const router = express.Router();

router.get('/', getMyConnections);
router.put('/:connectionId', updateConnectionStatus);
router.post('/', createConnectionRequest);




export default router;