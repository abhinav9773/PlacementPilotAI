import { useState, useRef, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  PHASE,
  SESSION_KEY,
  speakText,
  enterFullscreen,
  exitFullscreen,
} from "./interviewUtils";
import {
  CountdownOverlay,
  FullscreenShell,
  ScoreFlash,
  useMicVisualizer,
} from "./interviewShared";
import { InterviewSetupLayout } from "./InterviewSetupLayout";

export default function VideoInterview({
  isLight,
  savedSession,
  onSessionCleared,
}) {
  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e8eaf0" : "#1a1a2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#475569";
  const rowBorder = isLight ? "#f1f5f9" : "#13131f";
  const shadow = isLight ? "0 1px 4px #0000000a" : "none";

  const [phase, setPhase] = useState(PHASE.SETUP);
  const [form, setForm] = useState({
    role: "",
    company: "Google",
    round: "DSA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permError, setPermError] = useState(null);
  const [micError, setMicError] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(7);
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [showScoreFlash, setShowScoreFlash] = useState(false);
  const [flashData, setFlashData] = useState(null);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [cameraBlur, setCameraBlur] = useState(false);

  const videoRef = useRef();
  const recognitionRef = useRef();
  const streamRef = useRef();
  const endedRef = useRef(false);
  const transcriptBottomRef = useRef();
  const waveH = useRef(
    [...Array(24)].map(
      (_, i) => 8 + Math.sin(i * 0.7) * 22 + Math.random() * 12,
    ),
  );

  const micBars = useMicVisualizer(listening);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

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

  // Session restore is now driven by the savedSession prop passed from Interview.jsx
  // This avoids the race condition where enterFullscreen() was called in setTimeout
  // (async context = no user gesture = silently fails).
  // Instead, we just pre-fill the form so the user sees a resume banner and clicks
  // a button themselves — which IS a user gesture.
  const [showResumeBanner, setShowResumeBanner] = useState(!!savedSession);
  // Backend-stored incomplete video interviews (separate from localStorage session)
  const [activeVideoInterviews, setActiveVideoInterviews] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);

  // Fetch incomplete video interviews from backend when on setup screen
  useEffect(() => {
    if (phase === PHASE.SETUP) {
      api
        .get("/interview")
        .then((res) => {
          // Get localStorage session ID to avoid duplicate entry
          let lsSessionId = null;
          try {
            const vs = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
            if (vs) lsSessionId = vs.interviewId;
          } catch {}
          setActiveVideoInterviews(
            res.data.filter(
              (i) =>
                i.status === "active" &&
                i.history.length > 0 &&
                i.mode === "video" &&
                i._id !== lsSessionId, // don't duplicate the localStorage session
            ),
          );
        })
        .catch(() => {})
        .finally(() => setLoadingActive(false));
    }
  }, [phase]);

  useEffect(() => {
    if (phase === PHASE.INTERVIEW && interviewId) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          interviewId,
          currentQuestion,
          questionNumber,
          form,
          lastFeedback,
          savedAt: Date.now(),
          mode: "video",
        }),
      );
    }
  }, [phase, interviewId, currentQuestion, questionNumber, lastFeedback]);

  useEffect(() => {
    if (phase === PHASE.INTERVIEW && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const initCamera = async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  };

  const setupSpeechRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicError("Use Chrome or Edge for voice recognition.");
      return false;
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.maxAlternatives = 1;
    let final = "";
    r.onstart = () => {
      setListening(true);
      setMicError(null);
    };
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim = t;
      }
      setTranscript(final + interim);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed")
        setMicError("Microphone permission denied.");
      else if (e.error === "no-speech") {
        try {
          r.start();
        } catch {}
      }
    };
    r.onend = () => {
      setListening(false);
      if (!endedRef.current) {
        try {
          r.start();
        } catch {}
      }
    };
    recognitionRef.current = r;
    return true;
  }, []);

  const startListening = useCallback(() => {
    setTranscript("");
    try {
      recognitionRef.current?.stop();
    } catch {}
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch {}
    }, 300);
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  const hardStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setAiSpeaking(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  const startInterview = async () => {
    if (!form.role.trim()) {
      setError("Please enter the target role.");
      return;
    }

    // ✅ MUST call fullscreen HERE — synchronously inside the click handler
    // before any await. Browser only grants fullscreen on direct user gesture.
    enterFullscreen();

    setLoading(true);
    setError(null);
    setPermError(null);
    endedRef.current = false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await initCamera();
      setupSpeechRecognition();
      const res = await api.post("/interview/start", {
        ...form,
        mode: "video",
      });
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionNumber(res.data.questionNumber);
      setPhase(PHASE.COUNTDOWN);
    } catch (err) {
      // If something failed, exit fullscreen and show error
      exitFullscreen();
      if (err.name === "NotAllowedError")
        setPermError(
          "Camera/mic access required. Click the lock icon in your browser address bar.",
        );
      else setError("Failed to start interview. Please try again.");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      setLoading(false);
    }
  };

  // Resume a saved video session — called on button click (user gesture) so fullscreen works
  const resumeFromSession = async () => {
    if (!savedSession) return;
    // enterFullscreen MUST be synchronous here — direct click handler
    enterFullscreen();
    endedRef.current = false;
    setShowResumeBanner(false);
    const ok = await initCamera();
    setupSpeechRecognition();
    // Restore all session state
    setInterviewId(savedSession.interviewId);
    setCurrentQuestion(savedSession.currentQuestion);
    setQuestionNumber(savedSession.questionNumber);
    setForm(savedSession.form);
    setLastFeedback(savedSession.lastFeedback || null);
    setPhase(PHASE.INTERVIEW);
    // Speak the restored question after a short delay for camera to settle
    await new Promise((r) => setTimeout(r, 500));
    await speakText(
      savedSession.currentQuestion,
      () => setAiSpeaking(true),
      () => {
        setAiSpeaking(false);
        startListening();
      },
    );
  };

  const discardSession = () => {
    localStorage.removeItem(SESSION_KEY);
    onSessionCleared?.();
    setShowResumeBanner(false);
  };

  // Resume a backend-stored incomplete video interview (button click = user gesture)
  const resumeBackendInterview = async (interview) => {
    enterFullscreen(); // sync — must be first
    endedRef.current = false;
    setLoading(true);
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await initCamera();
      setupSpeechRecognition();
      const res = await api.post("/interview/resume", {
        interviewId: interview._id,
      });
      setInterviewId(interview._id);
      setForm({
        role: interview.role,
        company: interview.company,
        round: interview.round,
      });
      setCurrentQuestion(res.data.question);
      setQuestionNumber(res.data.questionNumber);
      setPhase(PHASE.INTERVIEW);
      await new Promise((r) => setTimeout(r, 400));
      await speakText(
        res.data.question,
        () => setAiSpeaking(true),
        () => {
          setAiSpeaking(false);
          startListening();
        },
      );
    } catch (err) {
      exitFullscreen();
      if (err.name === "NotAllowedError")
        setPermError("Camera/mic access required.");
      else setError("Failed to resume interview.");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      setLoading(false);
    }
  };

  const onCountdownDone = async () => {
    // Fullscreen already active — just transition and start speaking
    setPhase(PHASE.INTERVIEW);
    await new Promise((r) => setTimeout(r, 300));
    await speakText(
      currentQuestion,
      () => setAiSpeaking(true),
      () => {
        setAiSpeaking(false);
        startListening();
      },
    );
  };

  const submitAnswer = async () => {
    if (!transcript.trim() || submitting) return;
    stopListening();
    setSubmitting(true);
    const myAnswer = transcript.trim();
    const myQuestion = currentQuestion;
    setTranscript("");
    try {
      const res = await api.post("/interview/answer", {
        interviewId,
        question: myQuestion,
        answer: myAnswer,
      });
      setLastFeedback(res.data.feedback);
      if (res.data.complete) {
        hardStop();
        localStorage.removeItem(SESSION_KEY);
        setResult(res.data);
        exitFullscreen();
        setPhase(PHASE.COMPLETE);
      } else {
        setFlashData(res.data.feedback);
        setShowScoreFlash(true);
        setPendingQuestion(res.data.nextQuestion);
        setCurrentQuestion(res.data.nextQuestion);
        setQuestionNumber(res.data.questionNumber);
        setSubmitting(false);
      }
    } catch {
      setError("Failed to submit.");
      startListening();
      setSubmitting(false);
    }
  };

  const onScoreFlashDone = async () => {
    setShowScoreFlash(false);
    // Only speak the next question — score/feedback is shown visually, not read aloud
    if (!endedRef.current && pendingQuestion) {
      await new Promise((r) => setTimeout(r, 300));
      await speakText(
        pendingQuestion,
        () => setAiSpeaking(true),
        () => {
          setAiSpeaking(false);
          if (!endedRef.current) startListening();
        },
      );
    }
  };

  const endInterview = useCallback(() => {
    endedRef.current = true;
    hardStop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    localStorage.removeItem(SESSION_KEY);
    onSessionCleared?.(); // tell Interview.jsx the video session is gone
    exitFullscreen();
    setPhase(PHASE.SETUP);
    setCurrentQuestion("");
    setTranscript("");
    setInterviewId(null);
    setResult(null);
    setLastFeedback(null);
    setAiSpeaking(false);
    setListening(false);
    setError(null);
    setShowScoreFlash(false);
    setShowResumeBanner(false);
    setActiveVideoInterviews([]);
    setLoadingActive(true); // trigger re-fetch on setup
  }, [hardStop, onSessionCleared]);

  const reset = () => {
    endedRef.current = true;
    endInterview();
    setMicError(null);
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
        {/* Resume banner — shown when a mid-session video interview was saved */}
        {showResumeBanner && savedSession && (
          <div
            style={{
              marginBottom: "20px",
              background: isLight ? "#fffbeb" : "#f59e0b08",
              border: `1px solid ${isLight ? "#fde68a" : "#f59e0b35"}`,
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#f59e0b15",
                  border: "1px solid #f59e0b30",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className="ti ti-history"
                  style={{ fontSize: "18px", color: "#f59e0b" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: isLight ? "#92400e" : "#fbbf24",
                  }}
                >
                  Unfinished video interview
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isLight ? "#a16207" : "#d97706",
                    marginTop: "2px",
                  }}
                >
                  {savedSession.form?.role} · {savedSession.form?.company} · Q
                  {savedSession.questionNumber} reached
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={discardSession}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${isLight ? "#fde68a" : "#f59e0b30"}`,
                  background: "transparent",
                  color: isLight ? "#92400e" : "#f59e0b",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Discard
              </button>
              <button
                onClick={resumeFromSession}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 12px #f59e0b30",
                }}
              >
                Resume Interview →
              </button>
            </div>
          </div>
        )}
        {/* Backend-stored incomplete video interviews */}
        {!loadingActive && activeVideoInterviews.length > 0 && (
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
              Unfinished video sessions
            </div>
            {activeVideoInterviews.map((iv, i) => {
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
                    onClick={() => resumeBackendInterview(iv)}
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
          mode="video"
          form={form}
          setForm={setForm}
          loading={loading}
          error={error}
          permError={permError}
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
                ? "🎉 Excellent!"
                : sc >= 50
                  ? "💪 Good job!"
                  : "📚 Keep practicing!"}
            </h1>
            <p style={{ fontSize: "13px", color: muted }}>
              {form.role} · {form.company} · {form.round} · video
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

  // ── LIVE VIDEO ──
  if (phase !== PHASE.INTERVIEW) return null;
  return (
    <FullscreenShell
      form={form}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      isActive={true}
      onExit={endInterview}
    >
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* LEFT — AI */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg,#0f0f2a,#080810)",
            borderRight: "1px solid #1a1a2e",
            overflow: "hidden",
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
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "280px",
                height: "280px",
                background: "#6366f112",
                borderRadius: "50%",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />
            {aiSpeaking &&
              [140, 170, 200].map((size, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: "50%",
                    border: `1px solid #6366f1${i === 0 ? "40" : i === 1 ? "25" : "12"}`,
                    zIndex: 0,
                    animation: `pulse ${1.2 + i * 0.3}s ease-in-out infinite`,
                  }}
                />
              ))}
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                marginBottom: "24px",
                boxShadow: aiSpeaking
                  ? "0 0 50px #6366f190,0 0 100px #6366f140"
                  : "0 0 20px #6366f150",
                transition: "box-shadow 0.4s ease",
                zIndex: 1,
              }}
            >
              ✦
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginBottom: "20px",
                zIndex: 1,
              }}
            >
              {waveH.current.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "3px",
                    height: aiSpeaking ? `${h}px` : "4px",
                    background: "linear-gradient(to top,#6366f1,#a855f7)",
                    borderRadius: "2px",
                    transition: `height ${0.12 + (i % 5) * 0.03}s ease`,
                    opacity: aiSpeaking ? 0.6 + (i % 3) * 0.15 : 0.2,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#a5b4fc",
                zIndex: 1,
                marginBottom: "10px",
              }}
            >
              {aiSpeaking
                ? "AI Interviewer is speaking…"
                : submitting
                  ? "Evaluating your answer…"
                  : listening
                    ? "Listening to you…"
                    : "Ready"}
            </div>
            <div
              style={{
                padding: "5px 14px",
                background: aiSpeaking
                  ? "#6366f125"
                  : submitting
                    ? "#f59e0b20"
                    : listening
                      ? "#10b98120"
                      : "#ffffff08",
                border: `1px solid ${aiSpeaking ? "#6366f145" : submitting ? "#f59e0b40" : listening ? "#10b98140" : "#1a1a2e"}`,
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                color: aiSpeaking
                  ? "#a5b4fc"
                  : submitting
                    ? "#f59e0b"
                    : listening
                      ? "#10b981"
                      : "#475569",
                zIndex: 1,
              }}
            >
              {aiSpeaking
                ? "🔊 Speaking"
                : submitting
                  ? "⏳ Processing"
                  : listening
                    ? "🎙️ Recording"
                    : "⏸ Standby"}
            </div>
          </div>
          <div
            style={{
              padding: "20px 28px",
              borderTop: "1px solid #1a1a2e",
              background: "rgba(13,13,26,0.8)",
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
              style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.7" }}
            >
              {currentQuestion}
            </div>
          </div>
          {lastFeedback && (
            <div
              style={{
                padding: "12px 28px",
                borderTop: "1px solid #1a1a2e",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                background: "rgba(13,13,26,0.6)",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Last score:{" "}
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color:
                      (lastFeedback.score || 5) >= 7
                        ? "#10b981"
                        : (lastFeedback.score || 5) >= 5
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                >
                  {lastFeedback.score || 5}/10
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#6366f1",
                  background: "#6366f115",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                {lastFeedback.rating || "Average"}
              </span>
              {lastFeedback.suggestion && (
                <div
                  style={{ fontSize: "11px", color: "#475569", width: "100%" }}
                >
                  💡 {lastFeedback.suggestion}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Camera + transcript */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#080810",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              position: "relative",
              background: "#000",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: cameraBlur ? "blur(8px)" : "none",
                transition: "filter 0.4s ease",
              }}
            />
            {showScoreFlash && flashData && (
              <ScoreFlash
                score={flashData.score || 5}
                rating={flashData.rating || "Average"}
                onDone={onScoreFlashDone}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: listening ? "#10b981" : "#475569",
                  boxShadow: listening ? "0 0 8px #10b981" : "none",
                  transition: "all 0.3s",
                  animation: listening ? "micPulse 1.5s infinite" : "none",
                }}
              />
              <span
                style={{ fontSize: "12px", color: "#fff", fontWeight: 500 }}
              >
                You — {listening ? "Recording" : "Mic off"}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(6px)",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}
            >
              CANDIDATE CAM
            </div>
            <button
              onClick={() => setCameraBlur((b) => !b)}
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <i
                className={`ti ${cameraBlur ? "ti-eye" : "ti-eye-off"}`}
                style={{ fontSize: "12px" }}
              />
              {cameraBlur ? "Unblur" : "Blur bg"}
            </button>
          </div>

          <div
            style={{
              background: "#0d0d1a",
              borderTop: "1px solid #1a1a2e",
              padding: "14px 20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "2px",
                height: "28px",
                marginBottom: "10px",
              }}
            >
              {micBars.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.min(h, 28)}px`,
                    background: listening
                      ? "linear-gradient(to top,#10b981,#6ee7b7)"
                      : "#1e1e2e",
                    borderRadius: "2px",
                    transition: "height 0.08s ease",
                    opacity: listening ? 0.85 : 0.3,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: listening ? "#10b981" : "#334155",
                    boxShadow: listening ? "0 0 5px #10b981" : "none",
                    transition: "all 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#94a3b8",
                  }}
                >
                  Your answer transcript
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#334155" }}>
                {listening ? "● Recording" : "Paused"}
              </span>
            </div>
            <div
              style={{
                maxHeight: "80px",
                overflowY: "auto",
                background: "#080810",
                border: "1px solid #1a1a2e",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#e2e8f0",
                fontSize: "13px",
                lineHeight: "1.6",
                marginBottom: "10px",
              }}
            >
              {transcript || (
                <span style={{ color: "#334155" }}>
                  {aiSpeaking
                    ? "Wait for AI to finish speaking…"
                    : listening
                      ? "Speak now — words appear here in real-time…"
                      : "Click Resume mic to start recording"}
                </span>
              )}
              <div ref={transcriptBottomRef} />
            </div>
            {micError && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#f59e0b",
                  padding: "7px 12px",
                  background: "#f59e0b10",
                  borderRadius: "6px",
                  border: "1px solid #f59e0b30",
                  marginBottom: "8px",
                }}
              >
                ⚠️ {micError}
              </div>
            )}
            {error && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  padding: "7px 12px",
                  background: "#ef444410",
                  borderRadius: "6px",
                  border: "1px solid #ef444430",
                  marginBottom: "8px",
                }}
              >
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={listening ? stopListening : startListening}
                disabled={aiSpeaking || submitting}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: listening ? "#ef444415" : "#6366f115",
                  border: `1px solid ${listening ? "#ef444435" : "#6366f135"}`,
                  borderRadius: "8px",
                  color: listening ? "#ef4444" : "#6366f1",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: aiSpeaking || submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: aiSpeaking || submitting ? 0.4 : 1,
                  transition: "all 0.15s",
                }}
              >
                <i
                  className={`ti ${listening ? "ti-microphone-off" : "ti-microphone"}`}
                  style={{ fontSize: "14px" }}
                />
                {listening ? "Pause mic" : "Resume mic"}
              </button>
              <button
                onClick={submitAnswer}
                disabled={!transcript.trim() || submitting || aiSpeaking}
                style={{
                  flex: 2,
                  padding: "10px",
                  background:
                    !transcript.trim() || submitting || aiSpeaking
                      ? "#1e1e2e"
                      : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  borderRadius: "8px",
                  color:
                    !transcript.trim() || submitting || aiSpeaking
                      ? "#475569"
                      : "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    !transcript.trim() || submitting || aiSpeaking
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    transcript.trim() && !submitting && !aiSpeaking
                      ? "0 2px 12px #6366f140"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                <i className="ti ti-send" style={{ fontSize: "14px" }} />
                {submitting ? "Evaluating…" : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FullscreenShell>
  );
}

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
