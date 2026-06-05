import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview,
  resumeInterview,
  generateRoadmap,
} from '../controllers/interviewController.js';

const router = express.Router();
router.post('/resume', authMiddleware, resumeInterview);
router.post('/start', authMiddleware, startInterview);
router.post('/answer', authMiddleware, submitAnswer);
router.get('/roadmap', authMiddleware, generateRoadmap);
router.get('/', authMiddleware, getInterviews);
router.get('/:id', authMiddleware, getInterview);

export default router;
