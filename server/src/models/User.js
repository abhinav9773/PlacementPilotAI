import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  username: String,
  email: String,
  avatar: String,
  phone: String,
  preferences: {
    defaultCompany: { type: String, default: 'Google' },
    defaultRole: { type: String, default: '' },
    defaultRound: { type: String, default: 'DSA' },
    theme: { type: String, default: 'dark' },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);