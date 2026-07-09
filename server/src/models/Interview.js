// server/src/models/Interview.js
// Add TTL index + fix INTERVIEW_COMPLETE to use structured JSON

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Number,
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestion: String,
    rating: String,
  },
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  round: { type: String, required: true },
  mode: { type: String, enum: ["text", "video"], default: "text" },
  skills: [String],
  history: [messageSchema],
  status: { type: String, enum: ["active", "completed"], default: "active" },
  overallScore: Number,
  summary: String,
  createdAt: { type: Date, default: Date.now },
  // TTL field: abandoned active sessions auto-delete after 7 days
  // Completed interviews are kept (we null this out on completion)
  abandonedAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Indexes ────────────────────────────────────────────────────────────────
// Performance indexes for common queries
interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });

// TTL index: auto-delete documents where abandonedAt is set
// after 7 days (604800 seconds). We null this out when interview completes.
interviewSchema.index(
  { abandonedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }, // 7 days
);

// When an interview is completed, remove the abandonedAt field
// so the TTL index doesn't delete it
interviewSchema.pre("save", function () {
  if (this.status === "completed") {
    this.abandonedAt = undefined;
  }
});

export default mongoose.model("Interview", interviewSchema);
