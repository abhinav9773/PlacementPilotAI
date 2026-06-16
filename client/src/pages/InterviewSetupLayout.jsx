import { useState, useEffect, useRef } from "react";

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Goldman Sachs",
  "Atlassian",
  "Stripe",
  "Adobe",
  "Netflix",
  "Uber",
  "Flipkart",
  "Razorpay",
  "Swiggy",
  "Zomato",
  "Infosys",
  "TCS",
  "Wipro",
];
const ROUNDS = [
  { id: "DSA", icon: "ti-binary-tree", color: "#6366f1", light: "#eef2ff" },
  { id: "Technical", icon: "ti-code", color: "#8b5cf6", light: "#f5f3ff" },
  { id: "HR", icon: "ti-users", color: "#0ea5e9", light: "#f0f9ff" },
  {
    id: "System Design",
    icon: "ti-topology-ring",
    color: "#f59e0b",
    light: "#fffbeb",
  },
];

const TEXT_STEPS = [
  {
    icon: "ti-alarm",
    title: "3-second countdown",
    sub: "Fullscreen opens, compose yourself",
  },
  {
    icon: "ti-message-circle",
    title: "AI presents question",
    sub: "One focused question at a time",
  },
  {
    icon: "ti-keyboard",
    title: "Type your answer",
    sub: "No time pressure — think it through",
  },
  {
    icon: "ti-chart-bar",
    title: "Instant per-answer score",
    sub: "1–10 rating with tips",
  },
  {
    icon: "ti-trophy",
    title: "Final report",
    sub: "Overall score + full breakdown",
  },
];
const VIDEO_STEPS = [
  {
    icon: "ti-camera",
    title: "Grant camera & mic",
    sub: "One-time browser permission",
  },
  {
    icon: "ti-alarm",
    title: "3-second countdown",
    sub: "Compose yourself first",
  },
  {
    icon: "ti-volume",
    title: "AI speaks the question",
    sub: "Professional voice, clear pacing",
  },
  {
    icon: "ti-microphone",
    title: "You speak your answer",
    sub: "Transcribed live as you talk",
  },
  {
    icon: "ti-trophy",
    title: "Final report",
    sub: "Full breakdown after all questions",
  },
];
const TEXT_TIPS = [
  { icon: "ti-keyboard", text: "Ctrl+Enter to submit quickly." },
  { icon: "ti-device-floppy", text: "Sessions auto-save — resume anytime." },
  { icon: "ti-arrows-maximize", text: "Runs in distraction-free fullscreen." },
  { icon: "ti-chart-bar", text: "Every answer scored 1–10 with tips." },
];
const VIDEO_TIPS = [
  { icon: "ti-brand-chrome", text: "Use Chrome or Edge for speech." },
  { icon: "ti-microphone", text: "Speak after AI finishes talking." },
  { icon: "ti-lock", text: "Video is never recorded or stored." },
  { icon: "ti-player-pause", text: "Pause mic anytime before submitting." },
];

export function InterviewSetupLayout({
  isLight,
  mode,
  form,
  setForm,
  loading,
  error,
  permError,
  onStart,
}) {
  const isVideo = mode === "video";
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef();

  useEffect(() => {
    if (!showInfo) return;
    const h = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target))
        setShowInfo(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showInfo]);

  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e2e8f0" : "#1e1e2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#64748b";
  const subtle = isLight ? "#94a3b8" : "#334155";
  const inputBg = isLight ? "#f8fafc" : "#080812";
  const divider = isLight ? "#f1f5f9" : "#111120";
  const pageBg = isLight ? "#f8fafc" : "#07070f";

  const steps = isVideo ? VIDEO_STEPS : TEXT_STEPS;
  const tips = isVideo ? VIDEO_TIPS : TEXT_TIPS;

  const sel = {
    width: "100%",
    padding: "9px 12px",
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: "8px",
    color: text,
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "20px",
        alignItems: "start",
      }}
    >
      {/* ══ LEFT — main card ══ */}
      <div
        style={{
          background: card,
          border: `1px solid ${border}`,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Card top bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${divider}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: isLight
              ? "linear-gradient(to right, #fafbff, #f5f3ff)"
              : "linear-gradient(to right, #0d0d20, #0d0d1a)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className={`ti ${isVideo ? "ti-microphone" : "ti-keyboard"}`}
              style={{ fontSize: "17px", color: "#fff" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: text,
                letterSpacing: "-0.2px",
              }}
            >
              {isVideo ? "Voice Interview" : "Text Interview"}
            </div>
            <div style={{ fontSize: "11px", color: muted, marginTop: "1px" }}>
              {isVideo
                ? "AI speaks • You respond • Live transcription"
                : "Fullscreen focus • AI questions • Instant scoring"}
            </div>
          </div>
          {isVideo ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                background: "#d1fae510",
                border: "1px solid #10b98130",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#10b981",
                  letterSpacing: "0.5px",
                }}
              >
                AI VOICE
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                background: "#6366f110",
                border: "1px solid #6366f130",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#6366f1",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#6366f1",
                  letterSpacing: "0.5px",
                }}
              >
                FULLSCREEN
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Role */}
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: subtle,
                textTransform: "uppercase",
                letterSpacing: "0.9px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Target Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onStart()}
              placeholder="e.g. SDE Intern, Product Manager, Data Analyst…"
              style={{ ...sel, cursor: "text" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = border)}
            />
          </div>

          {/* Company + Round dropdowns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: subtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Company
              </label>
              <select
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                style={sel}
              >
                {COMPANIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: subtle,
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Round
              </label>
              <select
                value={form.round}
                onChange={(e) => setForm({ ...form, round: e.target.value })}
                style={sel}
              >
                {ROUNDS.map((r) => (
                  <option key={r.id}>{r.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Round pills — compact horizontal row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "8px",
            }}
          >
            {ROUNDS.map((r) => {
              const active = form.round === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setForm({ ...form, round: r.id })}
                  style={{
                    padding: "10px 6px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    background: active
                      ? isLight
                        ? r.light
                        : `${r.color}18`
                      : inputBg,
                    border: `${active ? "1.5" : "1"}px solid ${active ? r.color : border}`,
                    transition: "all 0.15s",
                    userSelect: "none",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                >
                  <i
                    className={`ti ${r.icon}`}
                    style={{
                      fontSize: "16px",
                      color: active ? r.color : muted,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: active ? 700 : 500,
                      color: active ? r.color : subtle,
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    {r.id}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {(error || permError) && (
            <div
              style={{
                fontSize: "12px",
                color: permError ? "#f59e0b" : "#ef4444",
                padding: "9px 12px",
                background: permError ? "#fffbeb" : "#fef2f2",
                borderRadius: "8px",
                border: `1px solid ${permError ? "#fde68a" : "#fecaca"}`,
                display: "flex",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span>{permError || error}</span>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onStart}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? isLight
                    ? "#e2e8f0"
                    : "#1e1e2e"
                  : "linear-gradient(135deg,#6366f1,#7c3aed)",
                color: loading ? muted : "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "all 0.15s",
                letterSpacing: "0.1px",
                boxShadow: !loading ? "0 2px 16px #6366f135" : "none",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <i
                className={`ti ${loading ? "ti-loader-2" : isVideo ? "ti-video" : "ti-arrows-maximize"}`}
                style={{ fontSize: "16px" }}
              />
              {loading
                ? isVideo
                  ? "Setting up…"
                  : "Starting…"
                : isVideo
                  ? "Start Voice Interview"
                  : "Start Text Interview"}
            </button>

            {/* ⓘ button */}
            <div ref={infoRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowInfo((v) => !v)}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  border: `1px solid ${showInfo ? "#6366f1" : border}`,
                  background: showInfo
                    ? isLight
                      ? "#eef2ff"
                      : "#6366f118"
                    : inputBg,
                  color: showInfo ? "#6366f1" : muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <i className="ti ti-info-circle" style={{ fontSize: "18px" }} />
              </button>

              {showInfo && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    right: 0,
                    width: "300px",
                    background: card,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    zIndex: 200,
                    boxShadow: isLight
                      ? "0 8px 32px #0000001a"
                      : "0 8px 32px #000000aa",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: -5,
                      right: 16,
                      width: 10,
                      height: 10,
                      background: card,
                      border: `1px solid ${border}`,
                      borderTop: "none",
                      borderLeft: "none",
                      transform: "rotate(45deg)",
                    }}
                  />

                  <div style={{ padding: "12px 14px 14px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#f59e0b",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <i className="ti ti-bulb" style={{ fontSize: "12px" }} />{" "}
                      Quick tips
                    </div>
                    {tips.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "flex-start",
                          marginBottom: i < tips.length - 1 ? "8px" : 0,
                        }}
                      >
                        <i
                          className={`ti ${t.icon}`}
                          style={{
                            fontSize: "13px",
                            color: "#f59e0b",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            color: muted,
                            lineHeight: 1.5,
                          }}
                        >
                          {t.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video privacy note */}
          {isVideo && (
            <div
              style={{
                display: "flex",
                gap: "7px",
                alignItems: "center",
                padding: "8px 11px",
                background: isLight ? "#f0fdf4" : "#10b98108",
                border: `1px solid ${isLight ? "#bbf7d0" : "#10b98120"}`,
                borderRadius: "8px",
              }}
            >
              <i
                className="ti ti-shield-check"
                style={{ fontSize: "13px", color: "#10b981", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: isLight ? "#166534" : "#6ee7b7",
                }}
              >
                Camera & mic required. Video is <strong>never recorded</strong>{" "}
                or stored.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT — side panel ══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* What you get */}
        <div
          style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${divider}`,
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, color: text }}>
              What you get
            </div>
            <div style={{ fontSize: "11px", color: muted, marginTop: "1px" }}>
              After every session
            </div>
          </div>
          {[
            {
              icon: "ti-chart-bar",
              color: "#6366f1",
              title: "Per-answer scoring",
              sub: "1–10 with strengths & tips",
            },
            {
              icon: "ti-message-2",
              color: "#8b5cf6",
              title: "Real follow-up questions",
              sub: "AI adapts to your answers",
            },
            {
              icon: "ti-trophy",
              color: "#f59e0b",
              title: "Final performance report",
              sub: "Overall score & breakdown",
            },
            {
              icon: "ti-refresh",
              color: "#10b981",
              title: "Resume anytime",
              sub: "Sessions save automatically",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "10px",
                padding: "10px 16px",
                borderBottom: i < 3 ? `1px solid ${divider}` : "none",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${item.icon}`}
                  style={{ fontSize: "14px", color: item.color }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: text,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{ fontSize: "11px", color: muted, marginTop: "1px" }}
                >
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            { val: "6–8", label: "Questions", icon: "ti-list" },
            { val: "~15", label: "Minutes", icon: "ti-clock" },
            { val: "1–10", label: "Score range", icon: "ti-star" },
            { val: "100%", label: "AI powered", icon: "ti-sparkles" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i
                className={`ti ${s.icon}`}
                style={{ fontSize: "14px", color: "#6366f1", flexShrink: 0 }}
              />
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: text,
                    lineHeight: 1.1,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{ fontSize: "10px", color: muted, marginTop: "1px" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
