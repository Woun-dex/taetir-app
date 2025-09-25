import express from "express";


import { getUser , getUserbyId , UpdateRole  } from "../controllers/userController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/me" ,getUser );
router.get("/user/:id", getUserbyId); 
router.post("/role" , UpdateRole);


export default router;