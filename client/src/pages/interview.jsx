import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import TextInterview from "./TextInterview";
import VideoInterview from "./VideoInterview";

const MODE_KEY = "pp_interview_mode";
const SESSION_KEY = "pp_video_interview";

export default function Interview() {
  const { theme } = useAuthStore();
  const isLight = theme === "light";

  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#64748b";
  const border = isLight ? "#e2e8f0" : "#1e1e2e";
  const tabBg = isLight ? "#f1f5f9" : "#0a0a14";
  const activeTabBg = isLight ? "#ffffff" : "#0d0d1a";

  const [mode, setMode] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (s && s.mode === "video" && Date.now() - s.savedAt < 30 * 60 * 1000) {
        localStorage.setItem(MODE_KEY, "video");
        return "video";
      }
    } catch {}
    return localStorage.getItem(MODE_KEY) || "text";
  });

  const [videoSession, setVideoSession] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (s && s.mode === "video" && Date.now() - s.savedAt < 30 * 60 * 1000)
        return s;
    } catch {}
    return null;
  });

  const handleSetMode = (m) => {
    localStorage.setItem(MODE_KEY, m);
    setMode(m);
  };
  const clearVideoSession = () => setVideoSession(null);

  return (
    <div
      style={{ width: "100%", fontFamily: "'Inter',-apple-system,sans-serif" }}
    >
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#6366f1",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            margin: "0 0 6px",
          }}
        >
          Mock Interview
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: text,
            letterSpacing: "-0.5px",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Practice like it's real
        </h1>
      </div>

      <div
        style={{
          display: "inline-flex",
          background: tabBg,
          borderRadius: "10px",
          padding: "3px",
          border: `1px solid ${border}`,
          marginBottom: "20px",
          gap: "2px",
        }}
      >
        {[
          {
            id: "text",
            icon: "ti-keyboard",
            label: "Text",
            sub: "Type answers",
          },
          {
            id: "video",
            icon: "ti-microphone",
            label: "Video",
            sub: "Speak answers",
          },
        ].map((m) => {
          const active = mode === m.id;
          const hasDot = m.id === "video" && videoSession && !active;
          return (
            <button
              key={m.id}
              onClick={() => handleSetMode(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: active ? activeTabBg : "transparent",
                boxShadow: active
                  ? isLight
                    ? "0 1px 3px #0000001a"
                    : "none"
                  : "none",
                cursor: "pointer",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              <i
                className={`ti ${m.icon}`}
                style={{ fontSize: "15px", color: active ? "#6366f1" : muted }}
              />
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    color: active ? text : muted,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.label} Interview
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: active ? "#818cf8" : muted,
                    marginTop: "1px",
                  }}
                >
                  {m.sub}
                </div>
              </div>
              {active && (
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#6366f1",
                    marginLeft: "2px",
                    flexShrink: 0,
                  }}
                />
              )}
              {hasDot && (
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {mode === "text" && <TextInterview isLight={isLight} />}
      {mode === "video" && (
        <VideoInterview
          isLight={isLight}
          savedSession={videoSession}
          onSessionCleared={clearVideoSession}
        />
      )}
    </div>
  );
}
