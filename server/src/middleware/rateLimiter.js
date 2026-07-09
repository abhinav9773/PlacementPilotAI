// server/src/middleware/rateLimiter.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General API limiter — all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for AI-heavy routes
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 AI calls per minute per IP
  message: {
    message: "Too many AI requests. Please wait a moment before continuing.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use userId if authenticated, otherwise fall back to IP (IPv6-safe)
  keyGenerator: (req) => req.user?.userId?.toString() || ipKeyGenerator(req),
});

// Interview start limiter — prevent session spam
export const interviewStartLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 new interviews per hour
  message: {
    message: "Too many interviews started. Take a break and come back soon!",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId?.toString() || ipKeyGenerator(req),
});
