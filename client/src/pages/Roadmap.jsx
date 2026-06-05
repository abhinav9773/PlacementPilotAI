import { useState, useEffect } from "react";
import api from "../api/axios";

const ROADMAP_KEY = "pp_roadmap";

export default function Roadmap({ isLight }) {
  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e2e8f0" : "#1e1e2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#64748b";
  const subtle = isLight ? "#94a3b8" : "#334155";
  const inputBg = isLight ? "#f8fafc" : "#080812";
  const divider = isLight ? "#f1f5f9" : "#111120";

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [context, setContext] = useState(null); // interview + resume context shown to user

  useEffect(() => {
    const stored = localStorage.getItem(ROADMAP_KEY);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setRoadmap(p.roadmap);
        setContext(p.context || null);
      } catch {
        localStorage.removeItem(ROADMAP_KEY);
      }
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch interviews + resume in parallel for context display
      const [roadmapRes, interviewsRes, resumeRes] = await Promise.allSettled([
        api.get("/interview/roadmap"),
        api.get("/interview"),
        api.get("/resume"),
      ]);

      if (roadmapRes.status === "rejected") throw roadmapRes.reason;

      const rd = roadmapRes.value.data;
      const interviews =
        interviewsRes.status === "fulfilled"
          ? interviewsRes.value.data.filter((i) => i.status === "completed")
          : [];
      const resume =
        resumeRes.status === "fulfilled" ? resumeRes.value.data : null;

      // Build context summary for display
      const ctx = {
        totalInterviews: interviews.length,
        avgScore: interviews.length
          ? Math.round(
              interviews.reduce((a, b) => a + (b.overallScore || 0), 0) /
                interviews.length,
            )
          : 0,
        rounds: [...new Set(interviews.map((i) => i.round))],
        weakAreas: interviews
          .flatMap(
            (iv) =>
              iv.history
                ?.filter((h) => (h.score || 5) < 6)
                .map((h) => ({
                  round: iv.round,
                  question: h.question,
                  score: h.score,
                })) || [],
          )
          .slice(0, 4),
        skills: resume?.skills || [],
      };

      setRoadmap(rd);
      setContext(ctx);
      localStorage.setItem(
        ROADMAP_KEY,
        JSON.stringify({ roadmap: rd, context: ctx }),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Complete at least one interview first.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearRoadmap = () => {
    setRoadmap(null);
    setContext(null);
    localStorage.removeItem(ROADMAP_KEY);
  };

  const weekColors = [
    { main: "#6366f1", bg: "#eef2ff", dark: "#6366f120" },
    { main: "#8b5cf6", bg: "#f5f3ff", dark: "#8b5cf620" },
    { main: "#0ea5e9", bg: "#f0f9ff", dark: "#0ea5e920" },
    { main: "#10b981", bg: "#f0fdf4", dark: "#10b98120" },
  ];

  const label = {
    fontSize: "10px",
    fontWeight: 700,
    color: subtle,
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    display: "block",
    marginBottom: "8px",
  };

  // ── Empty state ──
  if (!roadmap)
    return (
      <div style={{ width: "100%", fontFamily: "'Inter',sans-serif" }}>
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
            Roadmap
          </p>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Your preparation roadmap
          </h1>
          <p style={{ fontSize: "13px", color: muted, margin: 0 }}>
            AI-generated 4-week study plan based on your interview performance
            and skill gaps.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: card,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "48px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 4px 16px #6366f140",
              }}
            >
              <i
                className="ti ti-map-2"
                style={{ fontSize: "26px", color: "#fff" }}
              />
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: text,
                marginBottom: "8px",
                letterSpacing: "-0.3px",
              }}
            >
              Generate your roadmap
            </div>
            <div
              style={{
                fontSize: "13px",
                color: muted,
                marginBottom: "28px",
                maxWidth: "380px",
                margin: "0 auto 28px",
                lineHeight: 1.7,
              }}
            >
              We'll analyse your interview scores, weak questions, and resume
              skills to build a personalised 4-week study plan.
            </div>
            {error && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#ef4444",
                  padding: "10px 14px",
                  background: "#fef2f2",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  marginBottom: "16px",
                  maxWidth: "400px",
                  margin: "0 auto 16px",
                }}
              >
                ⚠️ {error}
              </div>
            )}
            <button
              onClick={generate}
              disabled={loading}
              style={{
                padding: "12px 28px",
                background: loading
                  ? isLight
                    ? "#e2e8f0"
                    : "#1e1e2e"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none",
                borderRadius: "10px",
                color: loading ? muted : "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: !loading ? "0 2px 16px #6366f135" : "none",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <i
                className={`ti ${loading ? "ti-loader-2" : "ti-sparkles"}`}
                style={{ fontSize: "16px" }}
              />
              {loading ? "Analysing your data…" : "Generate My Roadmap"}
            </button>
          </div>

          {/* What we use */}
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
                padding: "14px 18px",
                borderBottom: `1px solid ${divider}`,
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                What we analyse
              </div>
              <div style={{ fontSize: "11px", color: muted, marginTop: "2px" }}>
                Data used to build your plan
              </div>
            </div>
            {[
              {
                icon: "ti-chart-bar",
                color: "#6366f1",
                title: "Interview scores",
                desc: "Per-answer scores from all your completed interviews.",
              },
              {
                icon: "ti-alert-circle",
                color: "#ef4444",
                title: "Weak questions",
                desc: "Questions where you scored below 6 — these drive the plan.",
              },
              {
                icon: "ti-file-text",
                color: "#8b5cf6",
                title: "Resume skills",
                desc: "Your detected skills to identify gaps vs role requirements.",
              },
              {
                icon: "ti-target",
                color: "#10b981",
                title: "Round types practiced",
                desc: "DSA, Technical, HR, System Design coverage analysis.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "11px 18px",
                  borderBottom: i < 3 ? `1px solid ${divider}` : "none",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}25`,
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <i
                    className={`ti ${item.icon}`}
                    style={{ fontSize: "13px", color: item.color }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: text,
                      marginBottom: "1px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{ fontSize: "11px", color: muted, lineHeight: 1.4 }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  // ── Roadmap view ──
  return (
    <div style={{ width: "100%", fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
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
            Roadmap
          </p>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Your preparation roadmap
          </h1>
          <p style={{ fontSize: "13px", color: muted, margin: 0 }}>
            Personalised 4-week plan based on your interviews and resume.
          </p>
        </div>
        <button
          onClick={clearRoadmap}
          style={{
            padding: "8px 14px",
            background: "transparent",
            border: `1px solid ${border}`,
            borderRadius: "8px",
            color: muted,
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
        >
          <i className="ti ti-refresh" style={{ fontSize: "13px" }} />{" "}
          Regenerate
        </button>
      </div>

      {/* Context strip — shows what data was used */}
      {context && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          {[
            {
              icon: "ti-check",
              color: "#10b981",
              val: context.totalInterviews,
              label: "Interviews analysed",
            },
            {
              icon: "ti-chart-bar",
              color: "#6366f1",
              val: `${context.avgScore}%`,
              label: "Average score",
            },
            {
              icon: "ti-alert-circle",
              color: "#ef4444",
              val: context.weakAreas.length,
              label: "Weak areas found",
            },
            {
              icon: "ti-code",
              color: "#8b5cf6",
              val: context.skills.length,
              label: "Skills from resume",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${s.icon}`}
                  style={{ fontSize: "15px", color: s.color }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: text,
                    lineHeight: 1.1,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{ fontSize: "10px", color: muted, marginTop: "2px" }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI summary */}
      <div
        style={{
          background: isLight
            ? "linear-gradient(135deg,#eef2ff,#f5f3ff)"
            : "linear-gradient(135deg,#0f0f2a,#1a0a2e)",
          border: isLight ? "1px solid #c7d2fe" : "1px solid #6366f130",
          borderRadius: "14px",
          padding: "18px 22px",
          marginBottom: "18px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
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
            boxShadow: "0 2px 10px #6366f140",
          }}
        >
          <i
            className="ti ti-sparkles"
            style={{ fontSize: "17px", color: "#fff" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#6366f1",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "6px",
            }}
          >
            AI Assessment
          </div>
          <div
            style={{
              fontSize: "13px",
              color: isLight ? "#1e1b4b" : "#cbd5e1",
              lineHeight: 1.7,
            }}
          >
            {roadmap.summary}
          </div>
          {roadmap.estimatedReadyDate && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontWeight: 500,
              }}
            >
              <i
                className="ti ti-calendar-check"
                style={{ fontSize: "13px" }}
              />{" "}
              Ready by: {roadmap.estimatedReadyDate}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "18px",
          alignItems: "start",
        }}
      >
        {/* ── Weekly plan ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {roadmap.weeks?.map((week, i) => {
            const wc = weekColors[i] || weekColors[0];
            return (
              <div
                key={i}
                style={{
                  background: card,
                  border: `1px solid ${border}`,
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                {/* Week header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: `1px solid ${divider}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: isLight ? wc.bg : wc.dark,
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: isLight ? `${wc.main}20` : `${wc.main}30`,
                      border: `1px solid ${wc.main}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: wc.main,
                      flexShrink: 0,
                    }}
                  >
                    W{week.week}
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
                      {week.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: muted,
                        marginTop: "1px",
                      }}
                    >
                      Focus: {week.focus}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: wc.main,
                      background: `${wc.main}15`,
                      padding: "3px 8px",
                      borderRadius: "20px",
                      border: `1px solid ${wc.main}30`,
                    }}
                  >
                    Week {week.week}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Topics */}
                  <div>
                    <div style={label}>Topics</div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {week.topics?.map((topic, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: "11px",
                            padding: "3px 9px",
                            background: `${wc.main}10`,
                            border: `1px solid ${wc.main}25`,
                            borderRadius: "6px",
                            color: wc.main,
                            fontWeight: 500,
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <div style={label}>Resources</div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {week.resources?.map((r, j) => (
                        <div
                          key={j}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i
                            className="ti ti-external-link"
                            style={{
                              fontSize: "11px",
                              color: wc.main,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: "12px", color: muted }}>
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily goal */}
                {week.dailyGoal && (
                  <div
                    style={{
                      margin: "0 20px 16px",
                      padding: "10px 14px",
                      background: inputBg,
                      borderRadius: "8px",
                      borderLeft: `3px solid ${wc.main}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: subtle,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: "3px",
                      }}
                    >
                      Daily Goal
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: muted,
                        lineHeight: 1.5,
                      }}
                    >
                      {week.dailyGoal}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Priority topics */}
          {roadmap.priorityTopics?.length > 0 && (
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
                  Priority topics
                </div>
                <div
                  style={{ fontSize: "11px", color: muted, marginTop: "2px" }}
                >
                  Focus here first
                </div>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                }}
              >
                {roadmap.priorityTopics.map((topic, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#6366f110",
                        border: "1px solid #6366f125",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#6366f1",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      style={{ fontSize: "12px", color: text, fontWeight: 500 }}
                    >
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak areas that drove this plan */}
          {context?.weakAreas?.length > 0 && (
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
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <i
                  className="ti ti-alert-circle"
                  style={{ fontSize: "14px", color: "#ef4444" }}
                />
                <div>
                  <div
                    style={{ fontSize: "12px", fontWeight: 600, color: text }}
                  >
                    Weak areas detected
                  </div>
                  <div
                    style={{ fontSize: "11px", color: muted, marginTop: "1px" }}
                  >
                    Questions scored below 6
                  </div>
                </div>
              </div>
              <div style={{ padding: "10px 0" }}>
                {context.weakAreas.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 16px",
                      borderBottom:
                        i < context.weakAreas.length - 1
                          ? `1px solid ${divider}`
                          : "none",
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#ef4444",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "5px",
                        padding: "1px 6px",
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      {w.score}/10
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: muted,
                          marginBottom: "2px",
                        }}
                      >
                        {w.round}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: text,
                          lineHeight: 1.4,
                        }}
                      >
                        {w.question?.slice(0, 70)}
                        {w.question?.length > 70 ? "…" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume skills used */}
          {context?.skills?.length > 0 && (
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
                  Skills from your resume
                </div>
                <div
                  style={{ fontSize: "11px", color: muted, marginTop: "2px" }}
                >
                  Used to calibrate the plan
                </div>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                {context.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      background: "#8b5cf610",
                      border: "1px solid #8b5cf625",
                      borderRadius: "6px",
                      color: "#8b5cf6",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
