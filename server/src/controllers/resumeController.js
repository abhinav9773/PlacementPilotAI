import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");
import Resume from "../models/Resume.js";

const extractSkills = (text) => {
  const skillKeywords = [
    "javascript",
    "python",
    "java",
    "c++",
    "react",
    "node",
    "express",
    "mongodb",
    "sql",
    "git",
    "html",
    "css",
    "typescript",
    "aws",
    "docker",
    "kubernetes",
    "graphql",
    "rest",
    "redux",
    "next.js",
    "vue",
    "angular",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "linux",
  ];
  const lower = text.toLowerCase();
  return skillKeywords.filter((skill) => lower.includes(skill));
};

const parsePDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataReady", (data) => {
      const text = data.Pages.map((page) =>
        page.Texts.map((t) => {
          try {
            return decodeURIComponent(t.R.map((r) => r.T).join(""));
          } catch {
            return t.R.map((r) => r.T).join("");
          }
        }).join(" "),
      ).join("\n");
      resolve(text);
    });
    pdfParser.on("pdfParser_dataError", reject);
    pdfParser.parseBuffer(buffer);
  });
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rawText = await parsePDF(req.file.buffer);
    const skills = extractSkills(rawText);

    const existing = await Resume.findOne({ userId: req.user.userId });

    if (existing) {
      existing.fileName = req.file.originalname;
      existing.rawText = rawText;
      existing.skills = skills;
      existing.uploadedAt = new Date();
      await existing.save();
      return res.json({ message: "Resume updated", resume: existing });
    }

    const resume = await Resume.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      rawText,
      skills,
    });

    res.json({ message: "Resume uploaded", resume });
  } catch (err) {
    console.error("RESUME ERROR:", err);
    res.status(500).json({ message: "Failed to parse resume" });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.userId });
    if (!resume) return res.status(404).json({ message: "No resume found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
