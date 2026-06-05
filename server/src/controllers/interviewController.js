import Groq from "groq-sdk";
import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import {
  interviewerPrompt,
  evaluatorPrompt,
} from "../prompts/templates/interviewer.js";

console.log("GROQ KEY LOADED:", process.env.GROQ_API_KEY?.slice(0, 10));
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getResumeContext = async (userId) => {
  try {
    const resume = await Resume.findOne({ userId });
    if (!resume) return { skills: [], resumeContext: null };
    const resumeContext = resume.rawText
      ? resume.rawText.replace(/\s+/g, " ").trim().slice(0, 3000)
      : null;
    return { skills: resume.skills || [], resumeContext };
  } catch {
    return { skills: [], resumeContext: null };
  }
};

export const startInterview = async (req, res) => {
  try {
    const { role, company, round, mode = "text" } = req.body;
    if (!role || !company || !round) {
      return res
        .status(400)
        .json({ message: "role, company and round are required" });
    }
    const { skills, resumeContext } = await getResumeContext(req.user.userId);
    const interview = await Interview.create({
      userId: req.user.userId,
      role,
      company,
      round,
      mode,
      skills,
      history: [],
      status: "active",
    });
    const prompt = interviewerPrompt({
      role,
      company,
      round,
      skills,
      resumeContext,
      history: [],
    });
    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    res.json({
      interviewId: interview._id,
      question: message.choices[0].message.content,
      questionNumber: 1,
      mode: interview.mode,
    });
  } catch (err) {
    console.error("START INTERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to start interview" });
  }
};

export const resumeInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Not found" });
    const { skills, resumeContext } = await getResumeContext(req.user.userId);
    const nextPrompt = interviewerPrompt({
      role: interview.role,
      company: interview.company,
      round: interview.round,
      skills,
      resumeContext,
      history: interview.history.map((h) => ({
        question: h.question,
        answer: h.answer,
      })),
    });
    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: nextPrompt }],
    });
    res.json({
      question: message.choices[0].message.content,
      questionNumber: interview.history.length + 1,
      mode: interview.mode || "text",
      role: interview.role,
      company: interview.company,
      round: interview.round,
    });
  } catch (err) {
    console.error("RESUME INTERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to resume interview" });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, question, answer } = req.body;
    if (!interviewId || !question || !answer) {
      return res
        .status(400)
        .json({ message: "interviewId, question and answer are required" });
    }
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });
    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }
    const { skills, resumeContext } = await getResumeContext(req.user.userId);
    const evalPrompt = evaluatorPrompt({
      question,
      answer,
      role: interview.role,
      round: interview.round,
      skills,
      resumeContext,
    });
    const evalMessage = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [{ role: "user", content: evalPrompt }],
    });
    let feedback = {
      score: 5,
      strengths: [],
      weaknesses: [],
      suggestion: "",
      rating: "Average",
    };
    try {
      const clean = evalMessage.choices[0].message.content
        .replace(/```json|```/g, "")
        .trim();
      feedback = JSON.parse(clean);
    } catch (e) {
      console.error("Feedback parse error:", e);
    }

    interview.history.push({
      question,
      answer,
      score: feedback.score,
      feedback: {
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        suggestion: feedback.suggestion,
        rating: feedback.rating,
      },
    });
    await interview.save();

    const nextPrompt = interviewerPrompt({
      role: interview.role,
      company: interview.company,
      round: interview.round,
      skills,
      resumeContext,
      history: interview.history.map((h) => ({
        question: h.question,
        answer: h.answer,
      })),
    });
    const nextMessage = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: nextPrompt }],
    });
    const nextQuestion = nextMessage.choices[0].message.content;
    const isComplete = nextQuestion.includes("INTERVIEW_COMPLETE");

    if (isComplete) {
      const scores = interview.history.map((h) => h.score || 5);
      const overallScore = Math.round(
        (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
      );
      interview.status = "completed";
      interview.overallScore = overallScore;
      await interview.save();
      return res.json({
        complete: true,
        feedback,
        overallScore,
        totalQuestions: interview.history.length,
        history: interview.history,
      });
    }
    res.json({
      complete: false,
      feedback,
      nextQuestion,
      questionNumber: interview.history.length + 1,
    });
  } catch (err) {
    console.error("SUBMIT ANSWER ERROR:", err);
    res.status(500).json({ message: "Failed to process answer" });
  }
};

export const generateRoadmap = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.userId,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(10);
    if (interviews.length === 0) {
      return res
        .status(400)
        .json({ message: "Complete at least one interview first" });
    }

    const { skills, resumeContext } = await getResumeContext(req.user.userId);

    const weakAreas = [];
    const strongAreas = [];
    interviews.forEach((iv) => {
      (iv.history || []).forEach((h) => {
        const entry = {
          round: iv.round,
          role: iv.role,
          company: iv.company,
          question: h.question || "",
          score: h.score || 5,
          suggestion: (h.feedback && h.feedback.suggestion) || "",
        };
        if ((h.score || 5) < 6) weakAreas.push(entry);
        else if ((h.score || 5) >= 8) strongAreas.push(entry);
      });
    });

    const roundScores = {};
    interviews.forEach((iv) => {
      if (!roundScores[iv.round]) roundScores[iv.round] = [];
      roundScores[iv.round].push(iv.overallScore || 0);
    });
    const roundSummaryLines = Object.entries(roundScores)
      .map(([round, scores]) => {
        const avg = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        );
        return (
          "- " +
          round +
          ": " +
          avg +
          "% avg across " +
          scores.length +
          " interview(s)"
        );
      })
      .sort()
      .join("\n");

    const weakAreasLines = weakAreas
      .slice(0, 8)
      .map((w, i) => {
        return (
          i +
          1 +
          ". [" +
          w.round +
          "] Score: " +
          w.score +
          "/10\n" +
          '   Question: "' +
          w.question.slice(0, 120) +
          '"\n' +
          "   Suggestion: " +
          w.suggestion
        );
      })
      .join("\n\n");

    const strongAreasLines =
      strongAreas.length > 0
        ? "Strong areas (scored 8+) — do NOT over-focus on these:\n" +
          strongAreas
            .slice(0, 4)
            .map(
              (s) =>
                "- [" +
                s.round +
                '] "' +
                s.question.slice(0, 80) +
                '" (' +
                s.score +
                "/10)",
            )
            .join("\n")
        : "";

    const avgScore = Math.round(
      interviews.reduce((a, b) => a + (b.overallScore || 0), 0) /
        interviews.length,
    );
    const roles = [...new Set(interviews.map((i) => i.role))].join(", ");
    const companies = [...new Set(interviews.map((i) => i.company))].join(", ");
    const profileContext = resumeContext
      ? "Resume background:\n" + resumeContext.slice(0, 1500)
      : "Known skills: " + skills.join(", ");

    const promptParts = [
      "You are an expert career coach creating a highly personalised interview preparation roadmap.",
      "",
      "=== CANDIDATE PROFILE ===",
      "Target roles: " + roles,
      "Target companies: " + companies,
      profileContext,
      "",
      "=== INTERVIEW PERFORMANCE ===",
      "Total interviews completed: " + interviews.length,
      "Overall average score: " + avgScore + "%",
      "",
      "Per-round performance (weakest first):",
      roundSummaryLines,
      "",
      "Specific weak questions (scored below 6/10) — these MUST drive the roadmap:",
      weakAreasLines,
      "",
      strongAreasLines,
      "",
      "=== INSTRUCTIONS ===",
      "- The roadmap MUST directly address the weak questions listed above",
      "- Week titles and topics should reference the candidate's actual skill gaps",
      "- Prioritise rounds where the candidate scored lowest",
      "- Resources should be specific and relevant to the weak areas",
      "- Daily goals should be concrete and actionable",
      "- Do NOT suggest topics the candidate already scored 8+ on",
      "",
      "Return ONLY valid JSON, no preamble:",
      "{",
      '  "summary": "<3 sentences: current level, specific weak areas, what the plan fixes>",',
      '  "weeks": [',
      "    {",
      '      "week": 1,',
      '      "title": "<specific theme based on weakest area>",',
      '      "focus": "<exact focus area from weak questions>",',
      '      "topics": ["<topic 1>", "<topic 2>", "<topic 3>", "<topic 4>"],',
      '      "dailyGoal": "<concrete daily action>",',
      '      "resources": ["<resource 1>", "<resource 2>"]',
      "    }",
      "  ],",
      '  "priorityTopics": ["<t1>", "<t2>", "<t3>", "<t4>", "<t5>"],',
      '  "estimatedReadyDate": "<realistic timeline>"',
      "}",
    ];

    const prompt = promptParts.join("\n");

    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();
    const roadmap = JSON.parse(raw);
    res.json(roadmap);
  } catch (err) {
    console.error("ROADMAP ERROR:", err);
    res.status(500).json({ message: "Failed to generate roadmap" });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
