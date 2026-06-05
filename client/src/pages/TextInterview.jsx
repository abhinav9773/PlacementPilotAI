import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { PHASE, enterFullscreen, exitFullscreen } from "./interviewUtils";
import { CountdownOverlay, FullscreenShell } from "./interviewShared";
import { InterviewSetupLayout } from "./InterviewSetupLayout";

export default function TextInterview({ isLight }) {
  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e8eaf0" : "#1a1a2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#475569";
  const inputBg = isLight ? "#f8fafc" : "#0d0d1a";
  const inputBorder = isLight ? "#e2e8f0" : "#1e1e2e";
  const shadow = isLight ? "0 1px 4px #0000000a" : "none";
  const rowBorder = isLight ? "#f1f5f9" : "#13131f";

  const [phase, setPhase] = useState(PHASE.SETUP);
  const [form, setForm] = useState({
    role: "",
    company: "Google",
    round: "DSA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeInterviews, setActive] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQuestion]);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const p = res.data.preferences;
        if (p)
          setForm({
            role: p.defaultRole || "",
            company: p.defaultCompany || "Google",
            round: p.defaultRound || "DSA",
          });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === PHASE.SETUP) {
      api
        .get("/interview")
        .then((res) => {
          // Get saved video session ID to exclude it from text resume list
          let videoSessionId = null;
          try {
            const vs = JSON.parse(
              localStorage.getItem("pp_video_interview") || "null",
            );
            if (vs && Date.now() - vs.savedAt < 30 * 60 * 1000)
              videoSessionId = vs.interviewId;
          } catch {}
          setActive(
            res.data.filter(
              (i) =>
                i.status === "active" &&
                i.history.length > 0 &&
                i.mode !== "video" && // backend mode field
                i._id !== videoSessionId, // also exclude by saved session ID
            ),
          );
        })
        .catch(() => {})
        .finally(() => setLoadingActive(false));
    }
  }, [phase]);

  const startInterview = async () => {
    if (!form.role.trim()) {
      setError("Please enter the target role.");
      return;
    }
    // Call fullscreen synchronously before any await
    enterFullscreen();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/interview/start", { ...form, mode: "text" });
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionNumber(res.data.questionNumber);
      setPhase(PHASE.COUNTDOWN);
    } catch {
      exitFullscreen();
      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fullscreen already active — just transition phase
  const onCountdownDone = () => {
    setPhase(PHASE.INTERVIEW);
  };

  const resumeInterview = async (interview) => {
    // Call fullscreen synchronously on the Resume button click
    enterFullscreen();
    setLoading(true);
    setError(null);
    try {
      const rebuilt = [];
      interview.history.forEach((h, i) => {
        rebuilt.push({ type: "question", text: h.question, number: i + 1 });
        rebuilt.push({ type: "answer", text: h.answer });
        rebuilt.push({ type: "feedback", data: h.feedback });
      });
      setMessages(rebuilt);
      setForm({
        role: interview.role,
        company: interview.company,
        round: interview.round,
      });
      setInterviewId(interview._id);
      const res = await api.post("/interview/resume", {
        interviewId: interview._id,
      });
      setCurrentQuestion(res.data.question);
      setQuestionNumber(interview.history.length + 1);
      setPhase(PHASE.INTERVIEW);
    } catch {
      exitFullscreen();
      setError("Failed to resume interview.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    const myAnswer = answer;
    const myQuestion = currentQuestion;
    setAnswer("");
    setMessages((prev) => [
      ...prev,
      { type: "question", text: myQuestion, number: questionNumber },
      { type: "answer", text: myAnswer },
    ]);
    try {
      const res = await api.post("/interview/answer", {
        interviewId,
        question: myQuestion,
        answer: myAnswer,
      });
      if (res.data.complete) {
        setMessages((prev) => [
          ...prev,
          { type: "feedback", data: res.data.feedback },
        ]);
        setResult(res.data);
        exitFullscreen();
        setPhase(PHASE.COMPLETE);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "feedback", data: res.data.feedback },
        ]);
        setCurrentQuestion(res.data.nextQuestion);
        setQuestionNumber(res.data.questionNumber);
      }
    } catch {
      setError("Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    exitFullscreen();
    setPhase(PHASE.SETUP);
    setForm({ role: "", company: "Google", round: "DSA" });
    setMessages([]);
    setCurrentQuestion("");
    setAnswer("");
    setInterviewId(null);
    setResult(null);
    setError(null);
    setLoadingActive(true);
  };

  const cardStyle = {
    background: card,
    border: `1px solid ${border}`,
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "16px",
    boxShadow: shadow,
  };
  const cardHeader = {
    padding: "16px 24px",
    borderBottom: `1px solid ${border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  // ── COUNTDOWN ──
  if (phase === PHASE.COUNTDOWN)
    return <CountdownOverlay onDone={onCountdownDone} />;

  // ── SETUP ──
  if (phase === PHASE.SETUP)
    return (
      <div>
        {/* Resume banner — same style as video, rendered above the grid */}
        {!loadingActive && activeInterviews.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              background: isLight ? "#f0f4ff" : "#6366f108",
              border: `1px solid ${isLight ? "#c7d2fe" : "#6366f130"}`,
              borderRadius: "14px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#6366f1",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="ti ti-history" style={{ fontSize: "13px" }} />{" "}
              Unfinished sessions
            </div>
            {activeInterviews.map((iv, i) => {
              const date = new Date(iv.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    paddingTop: i > 0 ? "12px" : 0,
                    marginTop: i > 0 ? "12px" : 0,
                    borderTop:
                      i > 0
                        ? `1px solid ${isLight ? "#e0e7ff" : "#6366f120"}`
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: isLight ? "#0f172a" : "#f1f5f9",
                      }}
                    >
                      {iv.role} · {iv.company}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: isLight ? "#64748b" : "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      {iv.round} · {iv.history.length} answered · {date}
                    </div>
                  </div>
                  <button
                    onClick={() => resumeInterview(iv)}
                    disabled={loading}
                    style={{
                      padding: "7px 16px",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    Resume →
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <InterviewSetupLayout
          isLight={isLight}
          mode="text"
          form={form}
          setForm={setForm}
          loading={loading}
          error={error}
          onStart={startInterview}
        />
      </div>
    );

  // ── COMPLETE ──
  if (phase === PHASE.COMPLETE && result) {
    const sc = result.overallScore;
    const scoreColor = sc >= 75 ? "#10b981" : sc >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ width: "100%" }}>
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: text,
                marginBottom: "4px",
              }}
            >
              {sc >= 75
                ? "🎉 Great job!"
                : sc >= 50
                  ? "💪 Good effort!"
                  : "📚 Keep practicing!"}
            </h1>
            <p style={{ fontSize: "13px", color: muted }}>
              {form.role} · {form.company} · {form.round}
            </p>
          </div>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px #6366f140",
            }}
          >
            + New Interview
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "16px",
          }}
        >
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <div style={{ padding: "28px", textAlign: "center" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "12px",
                }}
              >
                Overall Score
              </div>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 700,
                  color: scoreColor,
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {sc}%
              </div>
              <div
                style={{ fontSize: "12px", color: muted, marginBottom: "16px" }}
              >
                Based on {result.totalQuestions} questions
              </div>
              <div
                style={{
                  height: "6px",
                  background: border,
                  borderRadius: "3px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${sc}%`,
                    background: scoreColor,
                    borderRadius: "3px",
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardHeader}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                Question Breakdown
              </div>
            </div>
            {result.history?.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 24px",
                  borderBottom:
                    i < result.history.length - 1
                      ? `1px solid ${rowBorder}`
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: h.feedback?.suggestion ? "8px" : 0,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6366f1",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      Q{i + 1}
                    </div>
                    <div
                      style={{ fontSize: "13px", color: text, fontWeight: 500 }}
                    >
                      {h.question}
                    </div>
                  </div>
                  <ScoreBadge score={h.score || 5} />
                </div>
                {h.feedback?.suggestion && (
                  <FeedbackTip tip={h.feedback.suggestion} isLight={isLight} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LIVE INTERVIEW ──
  if (phase !== PHASE.INTERVIEW) return null;
  return (
    <FullscreenShell
      form={form}
      questionNumber={questionNumber}
      totalQuestions={7}
      isActive={true}
      onExit={reset}
    >
      <div
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        {/* LEFT — AI panel */}
        <div
          style={{
            width: "42%",
            flexShrink: 0,
            borderRight: "1px solid #1a1a2e",
            display: "flex",
            flexDirection: "column",
            background: "#0d0d1a",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              position: "relative",
              background: "linear-gradient(180deg,#0f0f2a 0%,#0d0d1a 100%)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "200px",
                height: "200px",
                background: "#6366f115",
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "16px",
                boxShadow: "0 0 24px #6366f150",
                zIndex: 1,
              }}
            >
              ✦
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6366f1",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
                zIndex: 1,
              }}
            >
              AI Interviewer
            </div>
            <div style={{ fontSize: "11px", color: "#475569", zIndex: 1 }}>
              PlacementPilot AI
            </div>
          </div>
          <div
            style={{
              padding: "24px 28px",
              borderTop: "1px solid #1a1a2e",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#6366f1",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Q{questionNumber} · Current Question
            </div>
            <div
              style={{ fontSize: "15px", color: "#e2e8f0", lineHeight: "1.7" }}
            >
              {currentQuestion}
            </div>
          </div>
        </div>

        {/* RIGHT — Chat + answer */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#080810",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.map((msg, i) => {
              if (msg.type === "question")
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      animation: "fadeSlideIn 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      ✦
                    </div>
                    <div
                      style={{
                        background: "#0d0d1a",
                        border: "1px solid #1a1a2e",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        maxWidth: "80%",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#6366f1",
                          marginBottom: "5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          fontWeight: 600,
                        }}
                      >
                        Q{msg.number} · AI Interviewer
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#e2e8f0",
                          lineHeight: "1.6",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              if (msg.type === "answer")
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      animation: "fadeSlideIn 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        background: "#6366f115",
                        border: "1px solid #6366f130",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        maxWidth: "80%",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#a5b4fc",
                          marginBottom: "5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          fontWeight: 600,
                        }}
                      >
                        Your Answer
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#e2e8f0",
                          lineHeight: "1.6",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              if (msg.type === "feedback")
                return (
                  <div
                    key={i}
                    style={{
                      background: "#0a0a1a",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      gap: "14px",
                      flexWrap: "wrap",
                      alignItems: "center",
                      animation: "fadeSlideIn 0.3s ease",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      Score:{" "}
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            (msg.data?.score || 5) >= 7
                              ? "#10b981"
                              : (msg.data?.score || 5) >= 5
                                ? "#f59e0b"
                                : "#ef4444",
                        }}
                      >
                        {msg.data?.score || 5}/10
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569" }}>
                      Rating:{" "}
                      <span style={{ color: "#6366f1", fontWeight: 500 }}>
                        {msg.data?.rating || "Average"}
                      </span>
                    </div>
                    {msg.data?.suggestion && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          width: "100%",
                        }}
                      >
                        💡 {msg.data.suggestion}
                      </div>
                    )}
                  </div>
                );
              return null;
            })}
            {submitting && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  ✦
                </div>
                <div
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
                >
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#6366f1",
                        opacity: 0.4 + j * 0.3,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      marginLeft: "4px",
                    }}
                  >
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #1a1a2e",
              background: "#0d0d1a",
              flexShrink: 0,
            }}
          >
            {error && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  marginBottom: "8px",
                  padding: "8px 12px",
                  background: "#ef444410",
                  borderRadius: "6px",
                  border: "1px solid #ef444430",
                }}
              >
                {error}
              </div>
            )}
            <div
              style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
            >
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                    submitAnswer();
                }}
                placeholder="Type your answer here… (Ctrl+Enter to submit)"
                rows={3}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#080810",
                  border: "1px solid #1e1e2e",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.6",
                }}
              />
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || submitting}
                style={{
                  padding: "12px 22px",
                  height: "fit-content",
                  background:
                    !answer.trim() || submitting
                      ? "#1e1e2e"
                      : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  borderRadius: "10px",
                  color: !answer.trim() || submitting ? "#475569" : "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    !answer.trim() || submitting ? "not-allowed" : "pointer",
                  boxShadow:
                    answer.trim() && !submitting
                      ? "0 4px 16px #6366f140"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="ti ti-send" style={{ fontSize: "15px" }} /> Submit
              </button>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#334155",
                marginTop: "6px",
                textAlign: "right",
              }}
            >
              Ctrl+Enter to submit
            </div>
          </div>
        </div>
      </div>
    </FullscreenShell>
  );
}

// ── helpers ──
function ScoreBadge({ score }) {
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
  const bg = score >= 7 ? "#10b98115" : score >= 5 ? "#f59e0b15" : "#ef444415";
  const bdr = score >= 7 ? "#10b98130" : score >= 5 ? "#f59e0b30" : "#ef444430";
  return (
    <div
      style={{
        fontSize: "13px",
        fontWeight: 700,
        color,
        background: bg,
        padding: "4px 10px",
        borderRadius: "6px",
        border: `1px solid ${bdr}`,
        height: "fit-content",
        flexShrink: 0,
      }}
    >
      {score}/10
    </div>
  );
}
function FeedbackTip({ tip, isLight }) {
  return (
    <div
      style={{
        fontSize: "12px",
        color: isLight ? "#4338ca" : "#94a3b8",
        padding: "8px 12px",
        background: isLight ? "#f0f4ff" : "#6366f108",
        borderRadius: "6px",
        borderLeft: "2px solid #6366f1",
      }}
    >
      💡 {tip}
    </div>
  );
}
