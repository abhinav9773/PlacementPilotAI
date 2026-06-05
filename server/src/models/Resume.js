import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  rawText: String,
  skills: [String],
  education: [String],
  experience: [String],
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resume', resumeSchema);