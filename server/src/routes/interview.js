import express from "express";
import {
  startInterview,
  resumeInterview,
  submitAnswer,
  getInterviews,
  getInterview,
  generateRoadmap,
} from "../controllers/interviewController.js";
import protect from "../middleware/auth.js";
import { aiLimiter, interviewStartLimiter } from "../middleware/rateLimiter.js";
import { sanitizeInterview, validateAnswer } from "../middleware/sanitize.js";

const router = express.Router();
router.use(protect);
router.post("/start", interviewStartLimiter, sanitizeInterview, startInterview);
router.post("/resume", sanitizeInterview, resumeInterview);
router.post(
  "/answer",
  aiLimiter,
  sanitizeInterview,
  validateAnswer,
  submitAnswer,
);

router.get("/roadmap", aiLimiter, generateRoadmap);

router.get("/", getInterviews);
router.get("/:id", getInterview);

export default router;
