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
  mode: { type: String, enum: ["text", "video"], default: "text" }, // ← ADDED
  skills: [String],
  history: [messageSchema],
  status: { type: String, enum: ["active", "completed"], default: "active" },
  overallScore: Number,
  summary: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);
