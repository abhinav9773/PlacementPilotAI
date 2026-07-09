// server/src/routes/interviewRoutes.js
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

// All routes require auth
router.use(protect);

// Start — rate limited + sanitized
router.post("/start", interviewStartLimiter, sanitizeInterview, startInterview);

// Resume — sanitized
router.post("/resume", sanitizeInterview, resumeInterview);

// Answer — AI limiter + sanitized + answer validated
router.post(
  "/answer",
  aiLimiter,
  sanitizeInterview,
  validateAnswer,
  submitAnswer,
);

// Roadmap — AI limiter (expensive call)
router.get("/roadmap", aiLimiter, generateRoadmap);

// Read routes — no special limiting
router.get("/", getInterviews);
router.get("/:id", getInterview);

export default router;
