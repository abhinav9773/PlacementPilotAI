const MAX_LENGTHS = {
  role: 100,
  company: 100,
  round: 50,
  answer: 5000,
  question: 1000,
};

// Strip prompt injection patterns
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /forget\s+(all\s+)?(previous|prior|above)/gi,
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(a\s+)?(?!interviewer|candidate)/gi,
  /system\s*:\s*/gi,
  /\[system\]/gi,
  /\[user\]/gi,
  /\[assistant\]/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /###\s*(instruction|system|prompt)/gi,
];

const cleanString = (str, maxLen) => {
  if (typeof str !== "string") return "";
  // Trim whitespace
  let cleaned = str.trim();
  // Remove injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[removed]");
  }
  // Truncate to max length
  if (maxLen && cleaned.length > maxLen) {
    cleaned = cleaned.slice(0, maxLen);
  }
  return cleaned;
};

// Middleware: sanitize interview-related request bodies
export const sanitizeInterview = (req, res, next) => {
  if (req.body.role)
    req.body.role = cleanString(req.body.role, MAX_LENGTHS.role);
  if (req.body.company)
    req.body.company = cleanString(req.body.company, MAX_LENGTHS.company);
  if (req.body.round)
    req.body.round = cleanString(req.body.round, MAX_LENGTHS.round);
  if (req.body.answer)
    req.body.answer = cleanString(req.body.answer, MAX_LENGTHS.answer);
  if (req.body.question)
    req.body.question = cleanString(req.body.question, MAX_LENGTHS.question);
  next();
};

// Middleware: validate answer is long enough to be meaningful
export const validateAnswer = (req, res, next) => {
  const { answer } = req.body;
  if (!answer || answer.trim().length < 10) {
    return res.status(400).json({
      message:
        "Answer is too short. Please provide a meaningful response (at least 10 characters).",
    });
  }
  next();
};

export { cleanString };
