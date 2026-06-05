import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resume.js";
import interviewRoutes from "./routes/interview.js";

connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);

app.get("/", (req, res) => res.json({ message: "PlacementPilot API running" }));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
