import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, name: req.user.name, avatar: req.user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  },
);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// to update the username
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { username, phone, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, phone, preferences },
      { new: true },
    );
    res.json(user);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;
