import { createMentorProfile , getMentorProfile , findMentorsController  } from "../controllers/mentorController.js";

import express from "express";

const router = express.Router();


router.post("/create", createMentorProfile);
router.get("/:id", getMentorProfile);
router.get("/" ,findMentorsController );

export default router;