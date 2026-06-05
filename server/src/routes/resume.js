import express from "express";
import upload from "../config/multer.js";
import { uploadResume, getResume } from "../controllers/resumeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.get("/", authMiddleware, getResume);

export default router;
