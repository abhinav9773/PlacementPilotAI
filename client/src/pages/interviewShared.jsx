import { useState, useEffect, useRef } from "react";
import { enterFullscreen, exitFullscreen } from "./interviewUtils";

// ─── TIMER HOOK ───────────────────────────────────────────────────────────────
export function useTimer(active) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// ─── MIC VISUALIZER HOOK ──────────────────────────────────────────────────────
export function useMicVisualizer(active) {
  const [bars, setBars] = useState(Array(20).fill(4));
  const animRef = useRef();
  const analyserRef = useRef();
  const ctxRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    if (!active) {
      setBars(Array(20).fill(4));
      cancelAnimationFrame(animRef.current);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        streamRef.current = stream;
        ctxRef.current = new AudioContext();
        analyserRef.current = ctxRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        const source = ctxRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        const tick = () => {
          analyserRef.current.getByteFrequencyData(data);
          setBars(
            Array.from(data.slice(0, 20)).map((v) =>
              Math.max(4, (v / 255) * 44),
            ),
          );
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => {});
    return () => {
      cancelAnimationFrame(animRef.current);
      ctxRef.current?.close().catch(() => {});
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  return bars;
}

// ─── COUNTDOWN OVERLAY ────────────────────────────────────────────────────────
export function CountdownOverlay({ onDone }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count === 0) {
      setTimeout(onDone, 600);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#07070f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes countPop { 0%{transform:scale(2.2);opacity:0} 25%{transform:scale(0.95);opacity:1} 75%{transform:scale(1);opacity:1} 100%{transform:scale(0.7);opacity:0} }
        @keyframes ringExpand { 0%{transform:scale(0.7);opacity:0.7} 100%{transform:scale(1.8);opacity:0} }
        @keyframes goIn { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1);opacity:1} 100%{transform:scale(1);opacity:1} }
      `}</style>
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `${2 - i}px solid #6366f1`,
              opacity: count === 0 ? 0 : 1,
              animation:
                count > 0
                  ? `ringExpand 1s ease-out ${i * 0.2}s infinite`
                  : "none",
            }}
          />
        ))}
        <div
          key={`count-${count}`}
          style={{
            fontSize: count === 0 ? "52px" : "100px",
            fontWeight: 800,
            color: count === 0 ? "#10b981" : "#f1f5f9",
            animation:
              count === 0
                ? "goIn 0.5s ease forwards"
                : "countPop 1s ease forwards",
            letterSpacing: "-4px",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {count === 0 ? "GO!" : count}
        </div>
      </div>
      <div
        style={{
          marginTop: "48px",
          fontSize: "13px",
          color: "#475569",
          letterSpacing: "3px",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {count > 0 ? "Compose yourself..." : "Interview starting now"}
      </div>
      <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
        {[3, 2, 1].map((n) => (
          <div
            key={n}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                count <= n && count > 0
                  ? "#6366f1"
                  : count === 0
                    ? "#10b981"
                    : "#1a1a2e",
              transition: "all 0.3s",
              boxShadow:
                count === n || count === 0 ? "0 0 8px #6366f180" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SCORE FLASH ──────────────────────────────────────────────────────────────
export function ScoreFlash({ score, rating, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 7 ? "Great answer!" : score >= 5 ? "Good effort!" : "Keep going!";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: "rgba(7,7,15,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <style>{`@keyframes scoreIn { 0%{transform:translateY(40px) scale(0.7);opacity:0} 55%{transform:translateY(-8px) scale(1.06);opacity:1} 100%{transform:translateY(0) scale(1);opacity:1} }`}</style>
      <div
        style={{
          animation: "scoreIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "90px",
            fontWeight: 800,
            color,
            lineHeight: 1,
            marginBottom: "10px",
            textShadow: `0 0 60px ${color}50`,
          }}
        >
          {score}
          <span style={{ fontSize: "36px", color: "#334155", fontWeight: 600 }}>
            /10
          </span>
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color,
            marginBottom: "12px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#6366f1",
            background: "#6366f115",
            border: "1px solid #6366f130",
            padding: "5px 18px",
            borderRadius: "20px",
            display: "inline-block",
          }}
        >
          {rating}
        </div>
      </div>
    </div>
  );
}

// ─── END INTERVIEW CONFIRMATION MODAL ─────────────────────────────────────────
export function EndConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "#0d0d1a",
          border: "1px solid #1e1e2e",
          borderRadius: "20px",
          padding: "36px 40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "modalIn 0.2s ease",
        }}
      >
        <style>{`@keyframes modalIn { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }`}</style>

        {/* Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "#ef444415",
            border: "1px solid #ef444430",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4M12 17h.01"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: "8px",
          }}
        >
          End Interview?
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.6",
            marginBottom: "28px",
          }}
        >
          Your progress will be lost and the session will end. This cannot be
          undone.
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "1px solid #1e1e2e",
              background: "transparent",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#ffffff08")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              background: "#ef444420",
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              border: "1px solid #ef444440",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#ef444435")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#ef444420")
            }
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FULLSCREEN SHELL ─────────────────────────────────────────────────────────
export function FullscreenShell({
  children,
  onExit,
  form,
  questionNumber,
  totalQuestions,
  isActive,
}) {
  const timer = useTimer(isActive);
  const [showConfirm, setShowConfirm] = useState(false);
  const intentionalExitRef = useRef(false); // suppress fullscreenchange when we exit intentionally
  const progress = totalQuestions
    ? ((questionNumber - 1) / totalQuestions) * 100
    : 0;

  const handleEndClick = () => setShowConfirm(true);
  const handleConfirm = () => {
    intentionalExitRef.current = true;
    setShowConfirm(false);
    exitFullscreen();
    onExit?.();
  };
  const handleCancel = () => {
    // Re-enter fullscreen since browser exited it when ESC was pressed
    enterFullscreen();
    setShowConfirm(false);
  };

  // Bug 3 fix: listen to fullscreenchange instead of keydown.
  // Problem: browser processes ESC and exits fullscreen BEFORE any keydown listener fires,
  // so e.preventDefault() has no effect. The fix is to detect when fullscreen was exited
  // unexpectedly (i.e. not by our own handleConfirm) and show the modal then.
  useEffect(() => {
    const onFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      if (!isNowFullscreen) {
        if (intentionalExitRef.current) {
          // We triggered this exit (End Interview confirmed) — don't show modal
          intentionalExitRef.current = false;
        } else {
          // User pressed ESC — show confirmation modal
          setShowConfirm(true);
        }
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#07070f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: "#f1f5f9",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 #10b98140} 50%{box-shadow:0 0 0 8px #10b98100} }
      `}</style>

      {showConfirm && (
        <EndConfirmModal onConfirm={handleConfirm} onCancel={handleCancel} />
      )}

      {/* Top bar */}
      <div
        style={{
          height: "52px",
          flexShrink: 0,
          background: "rgba(13,13,26,0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#f1f5f9",
                letterSpacing: "-0.2px",
              }}
            >
              PlacementPilot
            </span>
          </div>
          <div
            style={{ width: "1px", height: "18px", background: "#1a1a2e" }}
          />
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {form.role} ·{" "}
            <span style={{ color: "#94a3b8" }}>{form.company}</span> ·{" "}
            <span style={{ color: "#6366f1" }}>{form.round}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 8px #ef4444",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#ef4444",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              REC
            </span>
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#f1f5f9",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "1px",
            }}
          >
            {timer}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#475569",
              background: "#1a1a2e",
              padding: "3px 10px",
              borderRadius: "20px",
            }}
          >
            Q{questionNumber}
            {totalQuestions ? ` / ~${totalQuestions}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <i className="ti ti-keyboard" style={{ fontSize: "12px" }} /> ESC to
            pause
          </div>
          <button
            onClick={handleEndClick}
            style={{
              padding: "6px 16px",
              background: "#ef444420",
              border: "1px solid #ef444440",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#ef444435")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#ef444420")
            }
          >
            <i className="ti ti-player-stop" style={{ fontSize: "12px" }} /> End
            Interview
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "3px",
          background: "#0d0d1a",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            transition: "width 0.9s ease",
            boxShadow: "0 0 10px #6366f170",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── MODE SELECTOR ────────────────────────────────────────────────────────────
export function ModeSelector({ mode, setMode, isLight }) {
  const border = isLight ? "#e8eaf0" : "#1a1a2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#475569";
  const bg = isLight ? "#ffffff" : "#0d0d1a";
  const modes = [
    {
      id: "text",
      icon: "ti-keyboard",
      label: "Text Interview",
      desc: "Type your answers",
    },
    {
      id: "video",
      icon: "ti-video",
      label: "Video Interview",
      desc: "Speak your answers with AI voice",
    },
  ];
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <div
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              background: active
                ? isLight
                  ? "linear-gradient(135deg,#eef2ff,#f5f0ff)"
                  : "#6366f112"
                : bg,
              border: `1.5px solid ${active ? "#6366f1" : border}`,
              transition: "all 0.15s",
              boxShadow: active ? "0 2px 12px #6366f115" : "none",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: active
                  ? "#6366f120"
                  : isLight
                    ? "#f1f5f9"
                    : "#1a1a2e",
                border: `1px solid ${active ? "#6366f140" : border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i
                className={`ti ${m.icon}`}
                style={{ fontSize: "18px", color: active ? "#6366f1" : muted }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: active ? "#6366f1" : text,
                  marginBottom: "2px",
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: "11px", color: muted }}>{m.desc}</div>
            </div>
            {active && (
              <div
                style={{
                  marginLeft: "auto",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#6366f1",
                  boxShadow: "0 0 6px #6366f1",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
