import express from 'express';
import { createUserProfile , getUserProfile , updateUserProfile , getMyProfile  , completeProfileSetup , updateProfileController} from '../controllers/profileController.js';
import { protect } from '../middleware/protect.js';
import { upload } from "../middleware/upload.js"

const router = express.Router();

router.post('/create', createUserProfile);
router.get('/:id', getUserProfile);
router.put('/', protect ,updateUserProfile);
router.get('/',  getMyProfile);
router.post('/update' , completeProfileSetup);
router.put('/change', upload.single('avatar_file'), updateProfileController);
export default router;

