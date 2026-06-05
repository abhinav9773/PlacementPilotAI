import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const RESUME_KEY = "pp_resume";

export default function Resume({ isLight }) {
  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e2e8f0" : "#1e1e2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#64748b";
  const subtle = isLight ? "#94a3b8" : "#334155";
  const inputBg = isLight ? "#f8fafc" : "#080812";
  const divider = isLight ? "#f1f5f9" : "#111120";

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("upload");
  const [showRaw, setShowRaw] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem(RESUME_KEY);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
        setView("result");
      } catch {
        localStorage.removeItem(RESUME_KEY);
      }
    }
    api
      .get("/resume")
      .then((res) => {
        setResult(res.data);
        setView("result");
        localStorage.setItem(RESUME_KEY, JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem(RESUME_KEY);
      });
  }, []);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError(null);
    } else setError("Only PDF files are allowed.");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.resume);
      setView("result");
      setFile(null);
      localStorage.setItem(RESUME_KEY, JSON.stringify(res.data.resume));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const label = {
    fontSize: "10px",
    fontWeight: 700,
    color: subtle,
    textTransform: "uppercase",
    letterSpacing: "0.9px",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div style={{ width: "100%", fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
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
          Resume
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: text,
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Your resume
          </h1>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Upload zone */}
          {view === "upload" && (
            <div
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${divider}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: "14px", fontWeight: 600, color: text }}
                  >
                    {result ? "Replace resume" : "Upload resume"}
                  </div>
                  <div
                    style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                  >
                    PDF only · Max 5MB
                  </div>
                </div>
                {result && (
                  <button
                    onClick={() => setView("result")}
                    style={{
                      padding: "6px 12px",
                      background: "transparent",
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      color: muted,
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div style={{ padding: "20px" }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => inputRef.current.click()}
                  style={{
                    border: `1.5px dashed ${dragging ? "#6366f1" : file ? "#10b981" : border}`,
                    borderRadius: "12px",
                    padding: "36px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging
                      ? "#6366f108"
                      : file
                        ? "#10b98108"
                        : inputBg,
                    transition: "all 0.2s",
                    marginBottom: "14px",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  <i
                    className={`ti ${file ? "ti-circle-check" : "ti-file-upload"}`}
                    style={{
                      fontSize: "30px",
                      color: file ? "#10b981" : "#6366f1",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: text,
                      marginBottom: "4px",
                    }}
                  >
                    {file ? file.name : "Drop your PDF here"}
                  </div>
                  <div style={{ fontSize: "12px", color: muted }}>
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : "or click to browse"}
                  </div>
                </div>
                {error && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#ef4444",
                      marginBottom: "12px",
                      padding: "9px 12px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      border: "1px solid #fecaca",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={{
                      flex: 1,
                      padding: "11px",
                      background:
                        !file || uploading
                          ? isLight
                            ? "#e2e8f0"
                            : "#1e1e2e"
                          : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      border: "none",
                      borderRadius: "10px",
                      color: !file || uploading ? muted : "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: !file || uploading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      fontFamily: "inherit",
                      boxShadow:
                        file && !uploading ? "0 2px 16px #6366f135" : "none",
                    }}
                  >
                    <i className="ti ti-upload" style={{ fontSize: "14px" }} />
                    {uploading ? "Parsing resume…" : "Upload & Analyze"}
                  </button>
                  {file && (
                    <button
                      onClick={() => {
                        setFile(null);
                        setError(null);
                      }}
                      style={{
                        padding: "11px 16px",
                        background: "transparent",
                        border: `1px solid ${border}`,
                        borderRadius: "10px",
                        color: muted,
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result card */}
          {view === "result" && result && (
            <div
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${divider}`,
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
                    background: "#10b98115",
                    border: "1px solid #10b98130",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i
                    className="ti ti-circle-check"
                    style={{ fontSize: "16px", color: "#10b981" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: "13px", fontWeight: 600, color: text }}
                  >
                    Resume active
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: muted,
                      marginTop: "1px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {result.fileName}
                  </div>
                </div>
                <button
                  onClick={() => setView("upload")}
                  style={{
                    padding: "6px 12px",
                    background: "#6366f110",
                    border: "1px solid #6366f130",
                    borderRadius: "8px",
                    color: "#6366f1",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Replace
                </button>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: `1px solid ${divider}`,
                }}
              >
                {[
                  {
                    label: "Skills detected",
                    value: result.skills?.length || 0,
                    color: "#6366f1",
                  },
                  {
                    label: "Resume parsed",
                    value: "✓ Ready",
                    color: "#10b981",
                  },
                  { label: "AI context", value: "Full text", color: "#8b5cf6" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 20px",
                      borderRight: i < 2 ? `1px solid ${divider}` : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: subtle,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: "6px",
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI context notice */}
              <div
                style={{
                  margin: "16px 20px 0",
                  padding: "10px 14px",
                  background: isLight ? "#f5f3ff" : "#8b5cf608",
                  border: `1px solid ${isLight ? "#ddd6fe" : "#8b5cf620"}`,
                  borderRadius: "10px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <i
                  className="ti ti-sparkles"
                  style={{
                    fontSize: "15px",
                    color: "#8b5cf6",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isLight ? "#6d28d9" : "#c4b5fd",
                      marginBottom: "2px",
                    }}
                  >
                    Full resume context active
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: isLight ? "#7c3aed" : "#a78bfa",
                      lineHeight: 1.5,
                    }}
                  >
                    The AI has access to your complete resume — not just
                    keywords. It will reference your actual projects,
                    experience, and tech stack when generating interview
                    questions.
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <label style={label}>
                    Detected skills{" "}
                    <span style={{ color: subtle, fontWeight: 400 }}>
                      ({result.skills?.length || 0} matched from keyword list)
                    </span>
                  </label>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {result.skills?.length > 0 ? (
                    result.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          background: "#6366f110",
                          border: "1px solid #6366f125",
                          borderRadius: "20px",
                          color: "#6366f1",
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "13px", color: muted }}>
                      No keywords matched — but full resume text is still used
                      by the AI.
                    </span>
                  )}
                </div>

                {/* Raw text preview toggle */}
                {result.rawText && (
                  <div>
                    <button
                      onClick={() => setShowRaw((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: muted,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      <i
                        className={`ti ${showRaw ? "ti-chevron-up" : "ti-chevron-down"}`}
                        style={{ fontSize: "12px" }}
                      />
                      {showRaw ? "Hide" : "Preview"} extracted text
                    </button>
                    {showRaw && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "12px 14px",
                          background: inputBg,
                          border: `1px solid ${border}`,
                          borderRadius: "8px",
                          fontSize: "11px",
                          color: muted,
                          lineHeight: 1.6,
                          maxHeight: "160px",
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                          fontFamily: "monospace",
                        }}
                      >
                        {result.rawText.slice(0, 1200)}
                        {result.rawText.length > 1200 ? "…" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* How it works */}
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
                How resume sync works
              </div>
              <div style={{ fontSize: "11px", color: muted, marginTop: "2px" }}>
                Your resume powers every interview
              </div>
            </div>
            {[
              {
                icon: "ti-file-upload",
                color: "#6366f1",
                title: "Upload your PDF",
                desc: "Full text extracted — skills, projects, education and experience.",
              },
              {
                icon: "ti-cpu",
                color: "#8b5cf6",
                title: "AI reads the full resume",
                desc: "Not just keywords — the AI gets your complete background.",
              },
              {
                icon: "ti-microphone",
                color: "#0ea5e9",
                title: "Personalized questions",
                desc: "AI references your actual projects and stack when asking questions.",
              },
              {
                icon: "ti-chart-bar",
                color: "#10b981",
                title: "Calibrated feedback",
                desc: "Scoring adjusts to your experience level automatically.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 18px",
                  borderBottom: i < 3 ? `1px solid ${divider}` : "none",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}25`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
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
                      fontWeight: 600,
                      color: text,
                      marginBottom: "2px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{ fontSize: "11px", color: muted, lineHeight: 1.5 }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
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
                Tips for best results
              </div>
            </div>
            <div style={{ padding: "8px 0" }}>
              {[
                "Include a clear Skills section listing all your technologies",
                "Describe projects with the tech stack used",
                "List frameworks and tools — React, Node, AWS, Docker etc.",
                "Add roles and responsibilities with concrete outcomes",
              ].map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "9px 18px",
                    borderBottom: i < 3 ? `1px solid ${divider}` : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#6366f110",
                      border: "1px solid #6366f125",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "#6366f1",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{ fontSize: "12px", color: muted, lineHeight: 1.5 }}
                  >
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
