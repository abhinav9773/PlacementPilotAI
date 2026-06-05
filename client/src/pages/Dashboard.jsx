import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Resume from "./Resume";
import Interview from "./interview";
import Analytics from "./analytics";
import Roadmap from "./Roadmap";
import Settings from "./Settings";
import api from "../api/axios";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const navItems = [
  { icon: "ti-layout-dashboard", label: "Dashboard", id: "dashboard" },
  { icon: "ti-microphone", label: "Interview", id: "interview" },
  { icon: "ti-file-cv", label: "Resume", id: "resume" },
  { icon: "ti-chart-bar", label: "Analytics", id: "analytics" },
  { icon: "ti-map", label: "Roadmap", id: "roadmap" },
  { icon: "ti-settings", label: "Settings", id: "settings" },
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function getTokens(isLight) {
  return {
    bg: isLight ? "#f4f6fb" : "#080810",
    sidebar: isLight ? "#ffffff" : "#0d0d1a",
    card: isLight ? "#ffffff" : "#0d0d1a",
    border: isLight ? "#e8eaf0" : "#1a1a2e",
    text: isLight ? "#0f172a" : "#f1f5f9",
    textSub: isLight ? "#334155" : "#cbd5e1",
    muted: isLight ? "#64748b" : "#475569",
    dim: isLight ? "#94a3b8" : "#334155",
    inputBg: isLight ? "#f8fafc" : "#080810",
    navHover: isLight ? "#f1f5f9" : "#ffffff08",
    navActive: isLight ? "#eef2ff" : "#6366f115",
  };
}

// Sign out confirmation modal
function SignOutModal({ isLight, onConfirm, onCancel }) {
  const t = getTokens(isLight);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "380px",
          width: "90%",
          boxShadow: "0 20px 60px #00000040",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            background: "#ef444415",
            border: "1px solid #ef444430",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <i
            className="ti ti-logout"
            style={{ fontSize: "20px", color: "#ef4444" }}
          />
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: t.text,
            marginBottom: "8px",
          }}
        >
          Sign out?
        </div>
        <div
          style={{
            fontSize: "13px",
            color: t.muted,
            lineHeight: "1.6",
            marginBottom: "24px",
          }}
        >
          You'll be returned to the landing page and will need to sign in again
          to access your account.
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              background: "transparent",
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              color: t.muted,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              background: "#ef444415",
              border: "1px solid #ef444430",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ user, setActive, isLight }) {
  const t = getTokens(isLight);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/interview")
      .then((res) => setInterviews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter((i) => i.status === "completed");
  const totalSessions = interviews.length;
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((a, b) => a + (b.overallScore || 0), 0) /
            completed.length,
        )
      : 0;
  const bestScore =
    completed.length > 0
      ? Math.max(...completed.map((i) => i.overallScore || 0))
      : 0;
  const bestRound =
    completed.length > 0
      ? Object.entries(
          completed.reduce((acc, i) => {
            if (!acc[i.round]) acc[i.round] = { total: 0, count: 0 };
            acc[i.round].total += i.overallScore || 0;
            acc[i.round].count += 1;
            return acc;
          }, {}),
        ).sort(
          (a, b) => b[1].total / b[1].count - a[1].total / a[1].count,
        )[0]?.[0]
      : "—";

  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions || "0",
      delta: `${completed.length} completed`,
    },
    {
      label: "Avg Score",
      value: avgScore ? `${avgScore}%` : "—",
      delta: "across all rounds",
    },
    {
      label: "Best Score",
      value: bestScore ? `${bestScore}%` : "—",
      delta: "personal best",
    },
    { label: "Best Round", value: bestRound, delta: "highest avg score" },
  ];

  const recentSessions = interviews.slice(0, 5);

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#6366f1",
            fontWeight: 600,
            letterSpacing: "1.5px",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          {getGreeting()}
        </div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 600,
            color: t.text,
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          {user?.name?.split(" ")[0] || "there"}, ready to practice? 👋
        </h1>
        <p style={{ fontSize: "14px", color: t.muted }}>
          {totalSessions === 0
            ? "Start your first mock interview to begin tracking your progress."
            : `You've completed ${completed.length} interview${completed.length !== 1 ? "s" : ""}. Keep going!`}
        </p>
      </div>

      <div
        style={{
          background: isLight
            ? "linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #eef2ff 100%)"
            : "linear-gradient(135deg, #0f0f2a 0%, #1a0a2e 50%, #0a0f2a 100%)",
          border: isLight ? "1px solid #c7d2fe" : "1px solid #6366f130",
          borderRadius: "16px",
          padding: "32px 36px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          boxShadow: isLight ? "0 4px 24px #6366f112" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "120px",
            width: "200px",
            height: "200px",
            background: isLight ? "#6366f110" : "#6366f120",
            borderRadius: "50%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ zIndex: 1 }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              color: "#8b5cf6",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            AI Interview Session
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: isLight ? "#1e1b4b" : "#f1f5f9",
              marginBottom: "8px",
              letterSpacing: "-0.4px",
            }}
          >
            Start a Mock Interview
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: isLight ? "#4338ca" : "#64748b",
              maxWidth: "380px",
              lineHeight: "1.6",
              opacity: isLight ? 0.7 : 1,
            }}
          >
            Choose your target company, role, and round type. Our AI will
            conduct a real-time interview and give detailed feedback.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {["DSA Round", "HR Round", "Technical", "System Design"].map(
              (t2) => (
                <span
                  key={t2}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: isLight ? "#ffffff60" : "#6366f115",
                    border: isLight
                      ? "1px solid #a5b4fc"
                      : "1px solid #6366f130",
                    borderRadius: "20px",
                    color: isLight ? "#4f46e5" : "#a5b4fc",
                  }}
                >
                  {t2}
                </span>
              ),
            )}
          </div>
        </div>
        <div style={{ zIndex: 1, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              marginBottom: "20px",
              justifyContent: "center",
            }}
          >
            {[14, 24, 18, 32, 22, 38, 26, 32, 18, 28, 16, 22].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  height: `${h}px`,
                  background: "linear-gradient(to top, #6366f1, #8b5cf6)",
                  borderRadius: "2px",
                  opacity: 0.7 + (i % 3) * 0.1,
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setActive("interview")}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: isLight
                ? "0 4px 16px #6366f150"
                : "0 0 20px #6366f150",
              display: "block",
              width: "100%",
            }}
          >
            ▶ Start Interview
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: "12px",
              padding: "18px 20px",
              boxShadow: isLight ? "0 1px 4px #0000000a" : "none",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: t.muted,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: t.text,
                marginBottom: "4px",
              }}
            >
              {loading ? "..." : s.value}
            </div>
            <div style={{ fontSize: "11px", color: "#6366f1" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: isLight ? "0 1px 4px #0000000a" : "none",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 500, color: t.text }}>
            Recent Sessions
          </div>
          <div
            onClick={() => setActive("analytics")}
            style={{
              fontSize: "12px",
              color: "#6366f1",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            View all →
          </div>
        </div>
        {loading ? (
          <div style={{ padding: "24px", fontSize: "13px", color: t.muted }}>
            Loading...
          </div>
        ) : recentSessions.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontSize: "13px",
              color: t.muted,
            }}
          >
            No sessions yet. Start your first interview!
          </div>
        ) : (
          recentSessions.map((s, i) => {
            const score = s.overallScore || 0;
            const isPassed = score >= 60;
            return (
              <div
                key={i}
                style={{
                  padding: "16px 24px",
                  borderBottom:
                    i < recentSessions.length - 1
                      ? `1px solid ${t.border}`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#6366f115",
                    border: "1px solid #6366f130",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#6366f1",
                    flexShrink: 0,
                  }}
                >
                  {s.company?.[0] || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: t.text,
                      marginBottom: "2px",
                    }}
                  >
                    {s.role} · {s.company}
                  </div>
                  <div style={{ fontSize: "11px", color: t.muted }}>
                    {s.round} Round · {timeAgo(s.createdAt)}
                  </div>
                </div>
                <div style={{ width: "80px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: t.muted,
                      marginBottom: "4px",
                      textAlign: "right",
                    }}
                  >
                    {s.status === "completed" ? `${score}%` : "—"}
                  </div>
                  <div
                    style={{
                      height: "3px",
                      background: t.border,
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${score}%`,
                        borderRadius: "2px",
                        background:
                          score >= 75
                            ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                            : score >= 60
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    flexShrink: 0,
                    background:
                      s.status === "completed"
                        ? isPassed
                          ? "#10b98115"
                          : "#ef444415"
                        : "#6366f115",
                    color:
                      s.status === "completed"
                        ? isPassed
                          ? "#10b981"
                          : "#ef4444"
                        : "#6366f1",
                    border: `1px solid ${s.status === "completed" ? (isPassed ? "#10b98130" : "#ef444430") : "#6366f130"}`,
                  }}
                >
                  {s.status === "completed"
                    ? isPassed
                      ? "Passed"
                      : "Review"
                    : "Active"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user, logout, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();
  const [active, setActiveState] = useState(
    localStorage.getItem("pp_tab") || "dashboard",
  );
  const [hoveredNav, setHoveredNav] = useState(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const isLight = theme === "light";
  const t = getTokens(isLight);

  const setActive = (tab) => {
    localStorage.setItem("pp_tab", tab);
    setActiveState(tab);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: t.bg,
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: t.text,
        overflow: "hidden",
        transition: "background 0.2s ease",
      }}
    >
      {showSignOutModal && (
        <SignOutModal
          isLight={isLight}
          onConfirm={handleLogout}
          onCancel={() => setShowSignOutModal(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          background: t.sidebar,
          borderRight: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 10,
          boxShadow: isLight ? "1px 0 0 #e8eaf0" : "none",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: "0 0 12px #6366f140",
            }}
          >
            ✦
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "-0.3px",
                color: t.text,
              }}
            >
              PlacementPilot
            </div>
            <div
              style={{ fontSize: "10px", color: "#6366f1", fontWeight: 500 }}
            >
              AI • Beta
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActive(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  marginBottom: "2px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive
                    ? t.navActive
                    : hoveredNav === item.id
                      ? t.navHover
                      : "transparent",
                  borderLeft: isActive
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                }}
              >
                <i
                  className={`ti ${item.icon}`}
                  style={{
                    fontSize: "16px",
                    color: isActive ? "#6366f1" : t.muted,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#6366f1" : t.muted,
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div
          style={{ padding: "10px 12px", borderTop: `1px solid ${t.border}` }}
        >
          <div
            onClick={() => setTheme(isLight ? "dark" : "light")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              background: t.navHover,
              border: `1px solid ${t.border}`,
              transition: "all 0.15s ease",
            }}
          >
            <i
              className={`ti ${isLight ? "ti-moon" : "ti-sun"}`}
              style={{ fontSize: "15px", color: "#6366f1" }}
            />
            <span style={{ fontSize: "12px", color: t.muted }}>
              {isLight ? "Dark mode" : "Light mode"}
            </span>
          </div>
        </div>

        {/* User profile section */}
        <div style={{ padding: "16px", borderTop: `1px solid ${t.border}` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <img
              src={user?.avatar}
              alt=""
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #6366f130",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: t.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "User"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: t.muted,
                  marginTop: "1px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email || "Google account"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            style={{
              width: "100%",
              padding: "8px",
              background: isLight ? "#fef2f2" : "#ef444412",
              border: "1px solid #ef444425",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#ef444420")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = isLight
                ? "#fef2f2"
                : "#ef444412")
            }
          >
            <i className="ti ti-logout" style={{ fontSize: "13px" }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {active === "dashboard" && (
          <DashboardHome user={user} setActive={setActive} isLight={isLight} />
        )}
        {active === "resume" && <Resume isLight={isLight} />}
        {active === "interview" && <Interview isLight={isLight} />}
        {active === "analytics" && <Analytics isLight={isLight} />}
        {active === "roadmap" && <Roadmap isLight={isLight} />}
        {active === "settings" && <Settings isLight={isLight} />}
      </main>
    </div>
  );
}
