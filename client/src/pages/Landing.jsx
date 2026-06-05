import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const handleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};
function GoogleButton({ large = false, dark }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={handleLogin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",

        padding: large ? "14px 28px" : "11px 22px",

        background:
          "linear-gradient(135deg, rgba(99,102,241,.12), rgba(168,85,247,.08), rgba(255,255,255,.03))",

        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",

        border: "1px solid rgba(165,180,252,.15)",
        borderRadius: "14px",

        boxShadow: hovered
          ? `
            0 12px 40px rgba(99,102,241,.22),
            inset 0 1px 0 rgba(255,255,255,.08)
          `
          : `
            0 4px 16px rgba(0,0,0,.15),
            inset 0 1px 0 rgba(255,255,255,.05)
          `,

        transform: hovered ? "translateY(-0.5px)" : "translateY(0)",

        transition: "all .25s ease",
        cursor: "pointer",
      }}
    >
      <svg
        width={large ? "18" : "15"}
        height={large ? "18" : "15"}
        viewBox="0 0 48 48"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>

      <span
        style={{
          fontSize: large ? "14px" : "13px",
          fontWeight: 600,
          color: dark ? "#f8fafc" : "#0f172a",
          letterSpacing: "-0.1px",
        }}
      >
        Continue with Google
      </span>
    </button>
  );
}

export default function Landing() {
  const featuresRef = useRef();
  const howRef = useRef();
  const pricingRef = useRef();
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < lastScrollY.current) {
        setShowNavbar(true);
      } else if (current > 80) {
        setShowNavbar(false);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { theme, setTheme } = useAuthStore();

  const dark = theme !== "light";

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const bg = dark ? "#080810" : "#f4f6fb";
  const surface = dark ? "#0d0d1a" : "#ffffff";
  const border = dark ? "#1a1a2e" : "#e8eaf0";
  const text = dark ? "#f1f5f9" : "#0f172a";
  const muted = dark ? "#64748b" : "#64748b";
  const sub = dark ? "#334155" : "#94a3b8";
  const cardBg = dark ? "#0d0d1a" : "#ffffff";
  const shadow = dark ? "none" : "0 1px 6px #0000000c";

  return (
    <div
      style={{
        background: bg,
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: text,
        overflowX: "hidden",
        minHeight: "100vh",
        transition: "background 0.2s ease",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 48px",
          borderBottom: `1px solid ${border}`,
          position: "fixed",
          top: showNavbar ? "0" : "-90px",
          left: 0,
          right: 0,
          zIndex: 100,
          background: dark ? "#080810e8" : "#f4f6fbe8",
          backdropFilter: "blur(12px)",
          transition: "top .28s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              boxShadow: "0 0 14px #6366f150",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: text,
              letterSpacing: "-0.3px",
            }}
          >
            PlacementPilot
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#6366f1",
              fontWeight: 600,
              background: "#6366f115",
              border: "1px solid #6366f130",
              borderRadius: "20px",
              padding: "2px 8px",
            }}
          >
            AI Beta
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[
            { label: "Features", ref: featuresRef },
            { label: "How it works", ref: howRef },
            { label: "Pricing", ref: pricingRef },
          ].map((item) => (
            <span
              key={item.label}
              onClick={() => scrollTo(item.ref)}
              style={{
                fontSize: "13px",
                color: muted,
                cursor: "pointer",
                fontWeight: 500,
                transition: "color 0.15s",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
              onMouseEnter={(e) => (e.target.style.color = text)}
              onMouseLeave={(e) => (e.target.style.color = muted)}
            >
              {item.label}
            </span>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            style={{
              width: "34px",
              height: "34px",
              background: dark ? "#1a1a2e" : "#ffffff",
              border: `1px solid ${border}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: shadow,
            }}
          >
            <i
              className={`ti ${dark ? "ti-sun" : "ti-moon"}`}
              style={{ fontSize: "15px", color: dark ? "#a5b4fc" : "#6366f1" }}
            />
          </button>
          <GoogleButton dark={dark} />
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          padding: "110px 24px 100px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "700px",
            background: dark
              ? "radial-gradient(circle, #6366f118 0%, transparent 65%)"
              : "radial-gradient(circle, #6366f110 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            background: dark ? "#6366f112" : "#eef2ff",
            border: `1px solid ${dark ? "#6366f130" : "#c7d2fe"}`,
            borderRadius: "20px",
            marginBottom: "32px",
          }}
        >
          <>
            <style>
              {`
      @keyframes pulseGlow {
        0% {
          transform: scale(1);
          box-shadow:
            0 0 4px #10b981,
            0 0 8px #10b981;
        }

        50% {
          transform: scale(0.65);
          box-shadow:
            0 0 12px #10b981,
            0 0 22px #10b981;
        }

        100% {
          transform: scale(1);
          box-shadow:
            0 0 4px #10b981,
            0 0 8px #10b981;
        }
      }
    `}
            </style>

            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulseGlow 1.5s infinite ease-in-out",
                flexShrink: 0,
              }}
            />
          </>
          <span
            style={{
              fontSize: "12px",
              color: dark ? "#a5b4fc" : "#4338ca",
              fontWeight: 500,
            }}
          >
            Powered by Llama 3.3 70B · Free to use
          </span>
        </div>

        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            letterSpacing: "-2.5px",
            lineHeight: "1.05",
            maxWidth: "750px",
            margin: "0 auto 20px",
          }}
        >
          <span style={{ color: text }}>Ace your next</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            interview with AI
          </span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: muted,
            maxWidth: "480px",
            margin: "0 auto 44px",
            lineHeight: "1.7",
          }}
        >
          Practice real-world mock interviews powered by AI. Get instant
          feedback, track your growth, and land your dream job.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <GoogleButton large dark={dark} />
          <span style={{ fontSize: "12px", color: sub }}>
            No credit card · Free forever · Takes 10 seconds
          </span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "inline-flex",
            marginTop: "72px",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: shadow,
          }}
        >
          {[
            { value: "1K+", label: "Mock interviews done" },
            { value: "4 round types", label: "DSA, HR, Tech, Design" },
            { value: "Instant", label: "AI feedback" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "20px 36px",
                textAlign: "center",
                borderRight: i < 2 ? `1px solid ${border}` : "none",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: text,
                  marginBottom: "4px",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={featuresRef}
        style={{ padding: "100px 48px", borderTop: `1px solid ${border}` }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            FEATURES
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1px",
              marginBottom: "12px",
            }}
          >
            Everything you need to prepare
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: muted,
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            From resume analysis to AI interviews — all in one place.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "ti-microphone",
              title: "AI Mock Interviews",
              desc: "Real follow-up questions based on your answers, just like a real interviewer. Supports DSA, HR, Technical, and System Design rounds.",
              color: "#6366f1",
            },
            {
              icon: "ti-file-cv",
              title: "Resume Analysis",
              desc: "Upload your resume and we extract your skills automatically. Interview questions are personalized based on your actual experience.",
              color: "#8b5cf6",
            },
            {
              icon: "ti-chart-bar",
              title: "Performance Analytics",
              desc: "Track scores over time, see which rounds you excel at, and identify areas for improvement with visual charts.",
              color: "#a855f7",
            },
            {
              icon: "ti-map",
              title: "AI Study Roadmap",
              desc: "After interviews, our AI builds a personalized 4-week study plan based on your weak areas and skill gaps.",
              color: "#d946ef",
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                padding: "28px",
                transition: "all 0.2s",
                boxShadow: shadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${f.color}60`;
                e.currentTarget.style.boxShadow = `0 4px 24px ${f.color}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.boxShadow = shadow;
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <i
                  className={`ti ${f.icon}`}
                  style={{ fontSize: "20px", color: f.color }}
                />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: text,
                  marginBottom: "8px",
                  letterSpacing: "-0.3px",
                }}
              >
                {f.title}
              </div>
              <div
                style={{ fontSize: "13px", color: muted, lineHeight: "1.7" }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        ref={howRef}
        style={{
          padding: "100px 48px",
          borderTop: `1px solid ${border}`,
          background: dark ? "#0d0d1a" : "#f8faff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            HOW IT WORKS
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1px",
              marginBottom: "12px",
            }}
          >
            Get started in 3 steps
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: muted,
              maxWidth: "380px",
              margin: "0 auto",
            }}
          >
            From sign up to your first interview in under 2 minutes.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {[
            {
              step: "01",
              title: "Sign in & upload resume",
              desc: "Sign in with Google and upload your resume PDF. We extract your skills automatically in seconds.",
              icon: "ti-upload",
            },
            {
              step: "02",
              title: "Configure your interview",
              desc: "Pick your target role, company, and round type. The AI personalizes questions based on your profile.",
              icon: "ti-settings",
            },
            {
              step: "03",
              title: "Practice & improve",
              desc: "Answer questions, get instant AI feedback with scores, and track progress over time.",
              icon: "ti-trending-up",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "32px 24px",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                boxShadow: shadow,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6366f1",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  marginBottom: "16px",
                }}
              >
                {s.step}
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#6366f115",
                  border: "1px solid #6366f130",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <i
                  className={`ti ${s.icon}`}
                  style={{ fontSize: "22px", color: "#6366f1" }}
                />
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: text,
                  marginBottom: "10px",
                  letterSpacing: "-0.3px",
                }}
              >
                {s.title}
              </div>
              <div
                style={{ fontSize: "13px", color: muted, lineHeight: "1.7" }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        ref={pricingRef}
        style={{ padding: "100px 48px", borderTop: `1px solid ${border}` }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            PRICING
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1px",
              marginBottom: "12px",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: muted,
              maxWidth: "380px",
              margin: "0 auto",
            }}
          >
            Start for free. No credit card required.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          {/* Free */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "20px",
              padding: "32px",
              boxShadow: shadow,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: muted,
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Free
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: 700,
                color: text,
                marginBottom: "4px",
                letterSpacing: "-1.5px",
              }}
            >
              ₹0
            </div>
            <div
              style={{ fontSize: "12px", color: muted, marginBottom: "24px" }}
            >
              Forever free
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              {[
                "Unlimited mock interviews",
                "Resume upload & analysis",
                "AI performance feedback",
                "Analytics dashboard",
                "Study roadmap generator",
              ].map((f) => (
                <div
                  key={f}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <i
                    className="ti ti-check"
                    style={{
                      fontSize: "14px",
                      color: "#10b981",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "13px", color: muted }}>{f}</span>
                </div>
              ))}
            </div>
            <GoogleButton dark={dark} />
          </div>

          {/* Pro */}
          <div
            style={{
              background: dark
                ? "linear-gradient(135deg, #0f0f2a, #1a0a2e)"
                : "linear-gradient(135deg, #eef2ff, #f5f0ff)",
              border: `1px solid ${dark ? "#6366f140" : "#c7d2fe"}`,
              borderRadius: "20px",
              padding: "32px",
              position: "relative",
              overflow: "hidden",
              boxShadow: dark ? "0 0 40px #6366f115" : "0 4px 24px #6366f112",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "150px",
                height: "150px",
                background: "#6366f115",
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "inline-block",
                fontSize: "10px",
                color: "#a5b4fc",
                fontWeight: 600,
                background: "#6366f120",
                border: "1px solid #6366f140",
                borderRadius: "20px",
                padding: "3px 10px",
                marginBottom: "8px",
              }}
            >
              COMING SOON
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#a5b4fc",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              Pro
            </div>
            <div
              style={{
                fontSize: "40px",
                fontWeight: 700,
                color: text,
                marginBottom: "4px",
                letterSpacing: "-1.5px",
              }}
            >
              ₹299
              <span style={{ fontSize: "16px", color: muted, fontWeight: 400 }}>
                /mo
              </span>
            </div>
            <div
              style={{ fontSize: "12px", color: muted, marginBottom: "24px" }}
            >
              Billed monthly
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              {[
                "Everything in Free",
                "Video interview mode",
                "Company-specific prep",
                "Interview recording",
                "Priority AI responses",
                "Export reports as PDF",
              ].map((f) => (
                <div
                  key={f}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <i
                    className="ti ti-check"
                    style={{
                      fontSize: "14px",
                      color: "#6366f1",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "13px", color: muted }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              style={{
                width: "100%",
                padding: "11px",
                background: "#6366f120",
                border: "1px solid #6366f140",
                borderRadius: "10px",
                color: "#a5b4fc",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "not-allowed",
              }}
            >
              Notify me when available
            </button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      {/* <section style={{ padding: '100px 48px', borderTop: `1px solid ${border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: dark ? 'radial-gradient(ellipse, #6366f115 0%, transparent 70%)' : 'radial-gradient(ellipse, #6366f110 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '42px', fontWeight: 700, color: text, letterSpacing: '-1.5px', marginBottom: '16px' }}>Start practicing today</h2>
          <p style={{ fontSize: '16px', color: muted, maxWidth: '400px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            Join thousands of students preparing smarter with AI-powered mock interviews.
          </p>
          <GoogleButton large dark={dark} />
        </div>
      </section> */}

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${border}`,

          background: dark ? "#090914" : "#fafbff",

          padding: "48px 48px 28px",

          marginTop: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",

            alignItems: "flex-start",

            marginBottom: "32px",
          }}
        >
          {/* Left */}

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",

                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",

                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

                  borderRadius: "8px",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  fontSize: "14px",
                }}
              >
                ✦
              </div>

              <span
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                PlacementPilot
              </span>
            </div>

            <p
              style={{
                color: muted,

                fontSize: "13px",

                maxWidth: "280px",

                lineHeight: "1.7",
              }}
            >
              AI powered interview preparation helping students practice
              smarter, improve faster, and land jobs.
            </p>
          </div>

          {/* Links */}

          <div
            style={{
              display: "flex",
              gap: "56px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                PRODUCT
              </div>

              {["Features", "Pricing", "Roadmap"].map((item) => (
                <div
                  key={item}
                  style={{
                    color: muted,

                    fontSize: "13px",

                    marginBottom: "10px",

                    cursor: "pointer",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 600,

                  marginBottom: "12px",
                }}
              >
                COMPANY
              </div>

              {["Privacy", "Terms", "Contact"].map((item) => (
                <div
                  key={item}
                  style={{
                    color: muted,

                    fontSize: "13px",

                    marginBottom: "10px",

                    cursor: "pointer",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div
          style={{
            borderTop: `1px solid ${border}`,

            paddingTop: "20px",

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",
          }}
        >
          <span
            style={{
              color: sub,

              fontSize: "12px",
            }}
          >
            © 2026 PlacementPilot · Built for students
          </span>

          <span
            style={{
              color: "#10b981",

              fontSize: "12px",

              fontWeight: 600,
            }}
          >
            ● All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}
