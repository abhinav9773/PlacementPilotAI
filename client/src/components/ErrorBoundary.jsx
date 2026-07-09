// client/src/components/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isLight = this.props.isLight;
    const bg = isLight ? "#f8fafc" : "#07070f";
    const card = isLight ? "#ffffff" : "#0d0d1a";
    const border = isLight ? "#e2e8f0" : "#1e1e2e";
    const text = isLight ? "#0f172a" : "#f1f5f9";
    const muted = isLight ? "#64748b" : "#64748b";

    return (
      <div
        style={{
          width: "100%",
          padding: "48px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <div
          style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "440px",
            width: "100%",
          }}
        >
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
              margin: "0 auto 20px",
            }}
          >
            <i
              className="ti ti-alert-triangle"
              style={{ fontSize: "24px", color: "#ef4444" }}
            />
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: text,
              marginBottom: "8px",
              letterSpacing: "-0.3px",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: muted,
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            This section encountered an unexpected error. Your other data is
            safe — try refreshing or navigating away.
          </p>
          {this.state.error && (
            <div
              style={{
                background: isLight ? "#f8fafc" : "#080812",
                border: `1px solid ${border}`,
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#ef4444",
                  fontFamily: "monospace",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </div>
            </div>
          )}
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "9px 20px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none",
                borderRadius: "9px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "9px 20px",
                background: "transparent",
                border: `1px solid ${border}`,
                borderRadius: "9px",
                color: muted,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
