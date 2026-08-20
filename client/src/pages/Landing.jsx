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
        padding: large ? "15px 32px" : "11px 22px",
        background: dark
          ? hovered
            ? "rgba(99,102,241,0.18)"
            : "rgba(99,102,241,0.1)"
          : hovered
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        border: dark
          ? "1px solid rgba(165,180,252,0.25)"
          : "1px solid rgba(99,102,241,0.2)",
        borderRadius: "12px",
        boxShadow: hovered
          ? dark
            ? "0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 24px rgba(99,102,241,0.2)"
          : dark
            ? "0 2px 12px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
          fontSize: large ? "15px" : "13px",
          fontWeight: 600,
          color: dark ? "#f1f5f9" : "#1e1b4b",
          letterSpacing: "-0.1px",
        }}
      >
        Continue with Google
      </span>
      {large && (
        <span style={{ fontSize: "14px", color: dark ? "#6366f1" : "#6366f1" }}>
          →
        </span>
      )}
    </button>
  );
}

// Animated counter
function Counter({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1200;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const featuresRef = useRef();
  const howRef = useRef();
  const pricingRef = useRef();
  const testimonialsRef = useRef();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const { theme, setTheme } = useAuthStore();
  const dark = theme !== "light";

  // Newsletter state
  const [email, setEmail] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setShowNavbar(current < lastScrollY.current || current < 80);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const showToast = (msg, success) => {
    setToastMsg(msg);
    setToastSuccess(success);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000);
  };

  const handleSubscribe = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      showToast("Please enter a valid email address.", false);
    } else {
      showToast("You're subscribed! Interview tips coming your way.", true);
      setEmail("");
    }
  };

  const bg = dark ? "#06060f" : "#fafbff";
  const surface = dark ? "#0d0d1a" : "#ffffff";
  const border = dark ? "#1a1a2e" : "#e8eaf0";
  const text = dark ? "#f1f5f9" : "#0f172a";
  const muted = dark ? "#64748b" : "#64748b";
  const sub = dark ? "#334155" : "#94a3b8";
  const cardBg = dark ? "#0d0d1a" : "#ffffff";
  const shadow = dark ? "none" : "0 1px 6px #0000000c";

  const socialLinks = [
    {
      icon: "ti-brand-x",
      label: "Twitter / X",
      href: "https://x.com/placementpilot",
    },
    {
      icon: "ti-brand-linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com/company/placementpilot",
    },
    {
      icon: "ti-brand-github",
      label: "GitHub",
      href: "https://github.com/placementpilot",
    },
    {
      icon: "ti-brand-discord",
      label: "Discord",
      href: "https://discord.gg/placementpilot",
    },
    {
      icon: "ti-brand-instagram",
      label: "Instagram",
      href: "https://instagram.com/placementpilot",
    },
  ];

  return (
    <div
      style={{
        background: bg,
        fontFamily: "'DM Sans', 'Inter', -apple-system, sans-serif",
        color: text,
        overflowX: "hidden",
        minHeight: "100vh",
        transition: "background 0.25s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 4px #10b981, 0 0 8px #10b981; }
          50% { transform: scale(0.65); box-shadow: 0 0 12px #10b981, 0 0 22px #10b981; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-48%, -52%) scale(1.05); }
          66% { transform: translate(-52%, -48%) scale(0.97); }
        }
        .hero-text { animation: fadeUp 0.8s ease both; }
        .hero-sub { animation: fadeUp 0.8s 0.15s ease both; }
        .hero-cta { animation: fadeUp 0.8s 0.3s ease both; }
        .hero-stats { animation: fadeUp 0.8s 0.45s ease both; }
        .feature-card { transition: all 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: ${text} !important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: "64px",
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          position: "fixed",
          top: showNavbar ? "0" : "-80px",
          left: 0,
          right: 0,
          zIndex: 100,
          background: dark ? "rgba(6,6,15,0.85)" : "rgba(250,251,255,0.85)",
          backdropFilter: "blur(20px)",
          transition: "top 0.28s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo1.png"
            alt="PlacementPilot"
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: text,
              letterSpacing: "0.0px",
              fontFamily: "'DM Serif Display', serif",
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
              letterSpacing: "0.5px",
            }}
          >
            AI BETA
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          {[
            { label: "Features", ref: featuresRef },
            { label: "How it works", ref: howRef },
            { label: "Reviews", ref: testimonialsRef },
            { label: "Pricing", ref: pricingRef },
          ].map((item) => (
            <span
              key={item.label}
              className="nav-link"
              onClick={() => scrollTo(item.ref)}
              style={{
                fontSize: "12px",
                color: muted,
                cursor: "pointer",
                fontWeight: 700,
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            style={{
              width: "36px",
              height: "36px",
              background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${border}`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
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

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          padding: "100px 48px 80px",
          textAlign: "center",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background orbs */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "800px",
            height: "800px",
            background: dark
              ? "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 60%)",
            pointerEvents: "none",
            animation: "orbFloat 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "300px",
            height: "300px",
            background: dark
              ? "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "10%",
            width: "250px",
            height: "250px",
            background: dark
              ? "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: dark ? 0.15 : 0.4,
            backgroundImage: `linear-gradient(${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div
            className="hero-text"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              background: dark
                ? "rgba(99,102,241,0.1)"
                : "rgba(99,102,241,0.07)",
              border: `1px solid ${dark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)"}`,
              borderRadius: "100px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulseGlow 1.5s infinite ease-in-out",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: dark ? "#a5b4fc" : "#4338ca",
                fontWeight: 500,
                letterSpacing: "0.2px",
              }}
            >
              Powered by GPT-OSS 120B · Free to use
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hero-sub"
            style={{
              fontSize: "clamp(48px, 7vw, 80px)",
              fontWeight: 800,
              letterSpacing: "-3px",
              lineHeight: "1.02",
              maxWidth: "820px",
              margin: "0 auto 24px",
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
            }}
          >
            <span style={{ color: text }}>Land your dream job</span>
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #ec4899 80%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              with AI interviews
            </span>
          </h1>

          <p
            className="hero-cta"
            style={{
              fontSize: "18px",
              color: muted,
              maxWidth: "520px",
              margin: "0 auto 48px",
              lineHeight: "1.75",
              fontWeight: 400,
            }}
          >
            Practice real-world mock interviews powered by AI. Get instant
            feedback, personalized coaching, and land your next offer.
          </p>

          <div
            className="hero-cta"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              marginBottom: "80px",
            }}
          >
            <GoogleButton large dark={dark} />
            <span
              style={{
                fontSize: "12px",
                color: sub,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="ti ti-lock" style={{ fontSize: "11px" }} /> No
              credit card · Free forever · 10 seconds to start
            </span>
          </div>

          {/* Stats strip */}
          <div
            className="hero-stats"
            style={{
              display: "inline-grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              background: dark ? "rgba(13,13,26,0.8)" : "rgba(255,255,255,0.8)",
              border: `1px solid ${border}`,
              borderRadius: "20px",
              overflow: "hidden",
              backdropFilter: "blur(12px)",
              boxShadow: dark
                ? "0 0 0 1px rgba(99,102,241,0.1)"
                : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {[
              { value: 1000, suffix: "+", label: "Mock interviews done" },
              {
                value: 4,
                suffix: " round types",
                label: "DSA, HR, Tech, Design",
              },
              { value: 100, suffix: "%", label: "AI-powered feedback" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "22px 36px",
                  textAlign: "center",
                  borderRight: i < 2 ? `1px solid ${border}` : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: text,
                    marginBottom: "4px",
                    letterSpacing: "-0.5px",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: "12px", color: muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF MARQUEE ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: dark
            ? "linear-gradient(135deg, #09091a 0%, #110830 50%, #09091a 100%)"
            : "linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #eef2ff 100%)",
          borderTop: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
          borderBottom: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `radial-gradient(circle at 25% 50%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(168,85,247,0.05) 0%, transparent 50%)`,
          }}
        />
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 8px",
            fontSize: "9px",
            fontWeight: 800,
            color: dark ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.45)",
            letterSpacing: "3px",
            textTransform: "uppercase",
            position: "relative",
            zIndex: 1,
          }}
        >
          Students preparing for top companies
        </div>
        <div
          style={{
            position: "relative",
            padding: "8px 0 14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "140px",
              background: dark
                ? "linear-gradient(90deg, #09091a, transparent)"
                : "linear-gradient(90deg, #eef2ff, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "140px",
              background: dark
                ? "linear-gradient(270deg, #09091a, transparent)"
                : "linear-gradient(270deg, #eef2ff, transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              animation: "marqueeLTR 36s linear infinite",
              width: "max-content",
            }}
          >
            {[
              { name: "Google", domain: "google.com" },
              { name: "Amazon", domain: "amazon.com" },
              { name: "Microsoft", domain: "microsoft.com" },
              { name: "Meta", domain: "meta.com" },
              { name: "Apple", domain: "apple.com" },
              { name: "Flipkart", domain: "flipkart.com" },
              { name: "Razorpay", domain: "razorpay.com" },
              { name: "Swiggy", domain: "swiggy.com" },
              { name: "Zomato", domain: "zomato.com" },
              { name: "Goldman Sachs", domain: "goldmansachs.com" },
              { name: "Atlassian", domain: "atlassian.com" },
              { name: "Stripe", domain: "stripe.com" },
              { name: "Adobe", domain: "adobe.com" },
              { name: "Netflix", domain: "netflix.com" },
              { name: "Uber", domain: "uber.com" },
              { name: "Infosys", domain: "infosys.com" },
              // duplicate for seamless loop
              { name: "Google", domain: "google.com" },
              { name: "Amazon", domain: "amazon.com" },
              { name: "Microsoft", domain: "microsoft.com" },
              { name: "Meta", domain: "meta.com" },
              { name: "Apple", domain: "apple.com" },
              { name: "Flipkart", domain: "flipkart.com" },
              { name: "Razorpay", domain: "razorpay.com" },
              { name: "Swiggy", domain: "swiggy.com" },
              { name: "Zomato", domain: "zomato.com" },
              { name: "Goldman Sachs", domain: "goldmansachs.com" },
              { name: "Atlassian", domain: "atlassian.com" },
              { name: "Stripe", domain: "stripe.com" },
              { name: "Adobe", domain: "adobe.com" },
              { name: "Netflix", domain: "netflix.com" },
              { name: "Uber", domain: "uber.com" },
              { name: "Infosys", domain: "infosys.com" },
            ].map((company, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "0 22px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                  alt={company.name}
                  width="24"
                  height="24"
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                    opacity: dark ? 0.9 : 1,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: dark
                      ? "rgba(203,213,225,0.65)"
                      : "rgba(51,65,85,0.65)",
                    letterSpacing: "0.1px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {company.name}
                </span>
              </span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marqueeLTR {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>

      {/* ── FEATURES ── */}
      <section
        ref={featuresRef}
        style={{
          padding: "120px 48px",
          borderTop: `1px solid ${border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-100px",
            width: "400px",
            height: "400px",
            background: dark
              ? "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
            Features
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1.5px",
              marginBottom: "16px",
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
            }}
          >
            Everything you need to prepare
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: muted,
              maxWidth: "440px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            From resume analysis to AI interviews — one platform, complete
            preparation.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "ti-microphone",
              title: "AI Mock Interviews",
              desc: "Real follow-up questions based on your answers, just like a real interviewer. Supports DSA, HR, Technical, and System Design rounds.",
              color: "#6366f1",
              tag: "Core",
            },
            {
              icon: "ti-file-cv",
              title: "Resume Analysis",
              desc: "Upload your resume and we extract your skills automatically. Interview questions are personalized based on your actual experience.",
              color: "#8b5cf6",
              tag: "Smart",
            },
            {
              icon: "ti-chart-bar",
              title: "Performance Analytics",
              desc: "Track scores over time, see which rounds you excel at, and identify areas for improvement with visual charts.",
              color: "#a855f7",
              tag: "Insights",
            },
            {
              icon: "ti-map",
              title: "AI Study Roadmap",
              desc: "After interviews, our AI builds a personalized 4-week study plan based on your weak areas and skill gaps.",
              color: "#ec4899",
              tag: "Guided",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "20px",
                padding: "32px",
                boxShadow: shadow,
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${f.color}50`;
                e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.boxShadow = shadow;
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "120px",
                  height: "120px",
                  background: `radial-gradient(circle at 80% 20%, ${f.color}12, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}25`,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className={`ti ${f.icon}`}
                    style={{ fontSize: "22px", color: f.color }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: f.color,
                    background: `${f.color}12`,
                    border: `1px solid ${f.color}25`,
                    borderRadius: "100px",
                    padding: "3px 10px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {f.tag}
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: text,
                  marginBottom: "10px",
                  letterSpacing: "-0.4px",
                }}
              >
                {f.title}
              </div>
              <div
                style={{ fontSize: "14px", color: muted, lineHeight: "1.7" }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        ref={howRef}
        style={{
          padding: "120px 48px",
          borderTop: `1px solid ${border}`,
          background: dark
            ? "linear-gradient(180deg, rgba(13,13,26,0.8) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(238,242,255,0.5) 0%, transparent 100%)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
            How it works
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1.5px",
              marginBottom: "16px",
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
            }}
          >
            Get started in 3 steps
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: muted,
              maxWidth: "380px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            From sign up to your first interview in under 2 minutes.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
            maxWidth: "960px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: "calc(16.6% + 24px)",
              right: "calc(16.6% + 24px)",
              height: "1px",
              background: `linear-gradient(90deg, #6366f1, #a855f7, #6366f1)`,
              opacity: 0.3,
              zIndex: 0,
            }}
          />

          {[
            {
              step: "01",
              title: "Sign in & upload resume",
              desc: "Sign in with Google and upload your resume PDF. We extract your skills automatically in seconds.",
              icon: "ti-upload",
              color: "#6366f1",
            },
            {
              step: "02",
              title: "Configure your interview",
              desc: "Pick your target role, company, and round type. The AI personalizes questions based on your profile.",
              icon: "ti-settings",
              color: "#8b5cf6",
            },
            {
              step: "03",
              title: "Practice & improve",
              desc: "Answer questions, get instant AI feedback with scores, and track progress over time.",
              icon: "ti-trending-up",
              color: "#a855f7",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "40px 32px",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius:
                  i === 0
                    ? "20px 4px 4px 20px"
                    : i === 2
                      ? "4px 20px 20px 4px"
                      : "4px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`,
                  border: `2px solid ${s.color}30`,
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  position: "relative",
                }}
              >
                <i
                  className={`ti ${s.icon}`}
                  style={{ fontSize: "26px", color: s.color }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "22px",
                    height: "22px",
                    background: s.color,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#fff",
                    border: `2px solid ${cardBg}`,
                  }}
                >
                  {i + 1}
                </div>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: sub,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                {s.step}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: text,
                  marginBottom: "12px",
                  letterSpacing: "-0.4px",
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

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={{ padding: "120px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
            Pricing
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: text,
              letterSpacing: "-1.5px",
              marginBottom: "16px",
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: muted,
              maxWidth: "380px",
              margin: "0 auto",
              lineHeight: "1.7",
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
            maxWidth: "740px",
            margin: "0 auto",
          }}
        >
          {/* Free */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "24px",
              padding: "36px",
              boxShadow: shadow,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: muted,
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                >
                  Free
                </div>
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 800,
                    color: text,
                    letterSpacing: "-2px",
                    lineHeight: 1,
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  ₹0
                </div>
                <div style={{ fontSize: "12px", color: sub, marginTop: "4px" }}>
                  Forever free
                </div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#6366f115",
                  border: "1px solid #6366f130",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="ti ti-gift"
                  style={{ fontSize: "22px", color: "#6366f1" }}
                />
              </div>
            </div>
            <div
              style={{
                height: "1px",
                background: border,
                marginBottom: "24px",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
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
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#10b98115",
                      border: "1px solid #10b98130",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="ti ti-check"
                      style={{ fontSize: "11px", color: "#10b981" }}
                    />
                  </div>
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
                ? "linear-gradient(145deg, #0f0f28, #1a0a32)"
                : "linear-gradient(145deg, #eef2ff, #f5f0ff)",
              border: `1px solid ${dark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.25)"}`,
              borderRadius: "24px",
              padding: "36px",
              position: "relative",
              overflow: "hidden",
              boxShadow: dark
                ? "0 0 60px rgba(99,102,241,0.1)"
                : "0 8px 40px rgba(99,102,241,0.12)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "-60px",
                width: "200px",
                height: "200px",
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                fontSize: "10px",
                color: "#a5b4fc",
                fontWeight: 700,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "100px",
                padding: "3px 10px",
                letterSpacing: "0.5px",
              }}
            >
              COMING SOON
            </div>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#a5b4fc",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Pro
              </div>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  color: text,
                  letterSpacing: "-2px",
                  lineHeight: 1,
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                ₹299
                <span
                  style={{ fontSize: "16px", color: muted, fontWeight: 400 }}
                >
                  /mo
                </span>
              </div>
              <div style={{ fontSize: "12px", color: sub, marginTop: "4px" }}>
                Billed monthly
              </div>
            </div>
            <div
              style={{
                height: "1px",
                background: "rgba(99,102,241,0.2)",
                marginBottom: "24px",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
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
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="ti ti-check"
                      style={{ fontSize: "11px", color: "#818cf8" }}
                    />
                  </div>
                  <span style={{ fontSize: "13px", color: muted }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
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

      {/* ── TESTIMONIALS ── */}
      <section
        ref={testimonialsRef}
        style={{ padding: "100px 48px", borderTop: `1px solid ${border}` }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#6366f1",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "1px",
                  background: "#6366f1",
                  display: "inline-block",
                }}
              />
              Reviews
              <span
                style={{
                  width: "24px",
                  height: "1px",
                  background: "#6366f1",
                  display: "inline-block",
                }}
              />
            </div>
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 44px)",
                fontWeight: 700,
                color: text,
                letterSpacing: "-1.5px",
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
              }}
            >
              Built for real results
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                quote:
                  "Got my Google SWE offer after 3 weeks of practicing here. The AI questions are scarily close to the real thing.",
                name: "Priya M.",
                role: "SDE @ Google",
                avatar: "P",
                stars: 5,
              },
              {
                quote:
                  "The resume-aware questions were a game changer. It asked about my specific projects, not generic stuff.",
                name: "Arjun K.",
                role: "SDE Intern @ Amazon",
                avatar: "A",
                stars: 5,
              },
              {
                quote:
                  "I love how the AI gives detailed feedback after each answer. Way better than reading interview prep books.",
                name: "Sneha R.",
                role: "Frontend Dev @ Razorpay",
                avatar: "S",
                stars: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "20px",
                  padding: "28px",
                  position: "relative",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(99,102,241,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{ display: "flex", gap: "3px", marginBottom: "16px" }}
                >
                  {Array(t.stars)
                    .fill(0)
                    .map((_, si) => (
                      <span
                        key={si}
                        style={{ color: "#f59e0b", fontSize: "14px" }}
                      >
                        ★
                      </span>
                    ))}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: muted,
                    lineHeight: "1.8",
                    marginBottom: "24px",
                  }}
                >
                  {t.quote}
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                      boxShadow: "0 0 12px rgba(99,102,241,0.4)",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: "13px", fontWeight: 700, color: text }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6366f1",
                        fontWeight: 500,
                        marginTop: "2px",
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: `1px solid ${border}`,
          background: dark ? "#06060f" : "#fafbff",
          padding: "64px 48px 0",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
              gap: "48px",
              paddingBottom: "56px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            {/* Brand + social */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <img
                  src="/logo1.png"
                  alt="PlacementPilot"
                  style={{
                    width: "74px",
                    height: "74px ",
                    borderRadius: "8px",
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: text,
                    fontFamily: "'DM Serif Display', serif",
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
                    letterSpacing: "0.5px",
                  }}
                >
                  AI BETA
                </span>
              </div>

              <p
                style={{
                  color: muted,
                  fontSize: "13px",
                  maxWidth: "260px",
                  lineHeight: "1.75",
                  marginBottom: "24px",
                }}
              >
                AI-powered interview preparation helping students practice
                smarter, improve faster, and land jobs at top companies.
              </p>

              {/* Social links */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "24px" }}
              >
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      width: "34px",
                      height: "34px",
                      background: dark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textDecoration: "none",
                      color: muted,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.background =
                        "rgba(99,102,241,0.12)";
                      e.currentTarget.style.color = "#a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = border;
                      e.currentTarget.style.background = dark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)";
                      e.currentTarget.style.color = muted;
                    }}
                  >
                    <i
                      className={`ti ${s.icon}`}
                      style={{ fontSize: "14px" }}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: text,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                Product
              </div>
              {[
                { label: "Features", ref: featuresRef },
                { label: "How it works", ref: howRef },
                { label: "Pricing", ref: pricingRef },
                { label: "Reviews", ref: testimonialsRef },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => item.ref && scrollTo(item.ref)}
                  style={{
                    color: muted,
                    fontSize: "13px",
                    marginBottom: "12px",
                    cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = dark ? "#a5b4fc" : "#4338ca")
                  }
                  onMouseLeave={(e) => (e.target.style.color = muted)}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div
              style={{
                background: dark
                  ? "rgba(99,102,241,0.06)"
                  : "rgba(99,102,241,0.05)",
                border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(99,102,241,0.2)",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: dark
                      ? "rgba(99,102,241,0.5)"
                      : "rgba(99,102,241,0.45)",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Stay updated
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(99,102,241,0.2)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: muted,
                  lineHeight: "1.5",
                  margin: "0 0 10px",
                }}
              >
                Get interview tips, company prep guides, and product updates.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  style={{
                    flex: 1,
                    background: dark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    color: text,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleSubscribe}
                  style={{
                    background: "#6366f1",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#4f46e5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#6366f1")
                  }
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          {/* Bottom bar */}
          <div
            style={{
              paddingTop: "20px",
              paddingBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: sub, fontSize: "12px" }}>
                © 2026 PlacementPilot AI
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  color: sub,
                }}
              >
                Made with <span style={{ color: "#ef4444" }}>♥</span> by{" "}
                <a
                  href="https://www.linkedin.com/in/abhinav-sharma-3a7b96316"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a5b4fc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#6366f1")
                  }
                >
                  Abhinav Sharma
                </a>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "16px" }}>
                {["Privacy", "Terms", "Cookies", "Security"].map((item) => (
                  <span
                    key={item}
                    style={{
                      color: sub,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = dark ? "#a5b4fc" : "#4338ca")
                    }
                    onMouseLeave={(e) => (e.target.style.color = sub)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── TOAST NOTIFICATION ── */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          background: dark ? "#0d0d1a" : "#ffffff",
          border: `1px solid ${
            toastSuccess
              ? dark
                ? "rgba(16,185,129,0.4)"
                : "rgba(16,185,129,0.3)"
              : dark
                ? "rgba(239,68,68,0.4)"
                : "rgba(239,68,68,0.3)"
          }`,
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: dark
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(0,0,0,0.12)",
          transform: toastVisible
            ? "translateY(0) scale(1)"
            : "translateY(80px) scale(0.95)",
          opacity: toastVisible ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: toastVisible ? "auto" : "none",
          maxWidth: "340px",
          minWidth: "260px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: toastSuccess
              ? "rgba(16,185,129,0.12)"
              : "rgba(239,68,68,0.12)",
            border: `1px solid ${toastSuccess ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i
            className={`ti ${toastSuccess ? "ti-check" : "ti-alert-circle"}`}
            style={{
              fontSize: "15px",
              color: toastSuccess ? "#10b981" : "#ef4444",
            }}
          />
        </div>

        {/* Message */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: text,
              marginBottom: "2px",
            }}
          >
            {toastSuccess ? "Subscribed!" : "Invalid email"}
          </div>
          <div style={{ fontSize: "12px", color: muted, lineHeight: 1.4 }}>
            {toastMsg}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setToastVisible(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: muted,
            fontSize: "16px",
            padding: "0",
            lineHeight: 1,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
        >
          <i className="ti ti-x" style={{ fontSize: "13px" }} />
        </button>
      </div>
    </div>
  );
}
