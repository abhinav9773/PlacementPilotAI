import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Settings() {
  const { user, logout, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();
  const isLight = theme === "light";

  const card = isLight ? "#ffffff" : "#0d0d1a";
  const border = isLight ? "#e8eaf0" : "#1a1a2e";
  const text = isLight ? "#0f172a" : "#f1f5f9";
  const muted = isLight ? "#64748b" : "#475569";
  const inputBg = isLight ? "#f8fafc" : "#080810";
  const inputBorder = isLight ? "#e2e8f0" : "#1e1e2e";
  const shadow = isLight ? "0 1px 4px #0000000a" : "none";
  const rowBorder = isLight ? "#f1f5f9" : "#13131f";

  const [profile, setProfile] = useState({ username: "", phone: "" });
  const [savedProfile, setSavedProfile] = useState({ username: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const profileChanged =
    profile.username !== savedProfile.username ||
    profile.phone !== savedProfile.phone;

  const [prefs, setPrefs] = useState({
    defaultCompany: "Google",
    defaultRole: "",
    defaultRound: "DSA",
  });
  const [savedPrefs, setSavedPrefs] = useState({
    defaultCompany: "Google",
    defaultRole: "",
    defaultRound: "DSA",
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const prefsChanged =
    prefs.defaultCompany !== savedPrefs.defaultCompany ||
    prefs.defaultRole !== savedPrefs.defaultRole ||
    prefs.defaultRound !== savedPrefs.defaultRound;

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const u = res.data;
        const p = { username: u.username || "", phone: u.phone || "" };
        const pf = {
          defaultCompany: u.preferences?.defaultCompany || "Google",
          defaultRole: u.preferences?.defaultRole || "",
          defaultRound: u.preferences?.defaultRound || "DSA",
        };
        setProfile(p);
        setSavedProfile(p);
        setPrefs(pf);
        setSavedPrefs(pf);
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!profileChanged) return;
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/me", {
        username: profile.username,
        phone: profile.phone,
        preferences: { ...prefs, theme },
      });
      const newProfile = {
        username: res.data.username || "",
        phone: res.data.phone || "",
      };
      setSavedProfile(newProfile);
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      alert("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async () => {
    if (!prefsChanged) return;
    setSavingPrefs(true);
    try {
      await api.put("/auth/me", {
        username: profile.username,
        phone: profile.phone,
        preferences: { ...prefs, theme },
      });
      setSavedPrefs({ ...prefs });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    } catch {
      alert("Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const cancelProfile = () => {
    setProfile(savedProfile);
    setEditingProfile(false);
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: "8px",
    color: text,
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
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
  const row = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    minHeight: "56px",
    gap: "12px",
  };
  const labelStyle = { fontSize: "13px", fontWeight: 500, color: text };
  const valueStyle = { fontSize: "13px", color: muted };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#6366f1",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Settings
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: text,
            letterSpacing: "-0.4px",
            marginBottom: "4px",
          }}
        >
          Account settings
        </h1>
        <p style={{ fontSize: "13px", color: muted }}>
          Manage your profile and preferences.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          {/* Profile */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                  Profile
                </div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "1px" }}
                >
                  Your personal information
                </div>
              </div>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    padding: "7px 16px",
                    background: "#6366f115",
                    border: "1px solid #6366f130",
                    borderRadius: "8px",
                    color: "#6366f1",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              ) : (
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <button
                    onClick={cancelProfile}
                    style={{
                      padding: "7px 14px",
                      background: "transparent",
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      color: muted,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={savingProfile || !profileChanged}
                    style={{
                      padding: "7px 16px",
                      background: !profileChanged
                        ? isLight
                          ? "#e2e8f0"
                          : "#1e1e2e"
                        : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      border: "none",
                      borderRadius: "8px",
                      color: !profileChanged ? muted : "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor:
                        savingProfile || !profileChanged
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {!profileChanged && (
                      <i className="ti ti-lock" style={{ fontSize: "11px" }} />
                    )}
                    {savingProfile ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ ...row, borderBottom: `1px solid ${rowBorder}` }}>
              <div>
                <div style={labelStyle}>Photo</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Managed by Google
                </div>
              </div>
              <img
                src={user?.avatar}
                alt=""
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "2px solid #6366f130",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div style={{ ...row, borderBottom: `1px solid ${rowBorder}` }}>
              <div style={labelStyle}>Full name</div>
              <div style={valueStyle}>{user?.name}</div>
            </div>
            <div
              style={{
                ...row,
                borderBottom: `1px solid ${rowBorder}`,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: "120px" }}>
                <div style={labelStyle}>Username</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Your public handle
                </div>
              </div>
              {editingProfile ? (
                <input
                  type="text"
                  placeholder="e.g. abhinav99"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  style={{ ...inputStyle, maxWidth: "200px" }}
                  autoFocus
                />
              ) : (
                <div style={valueStyle}>
                  {savedProfile.username ? (
                    <span style={{ color: "#6366f1", fontWeight: 500 }}>
                      @{savedProfile.username}
                    </span>
                  ) : (
                    <span style={{ fontStyle: "italic" }}>Not set</span>
                  )}
                </div>
              )}
            </div>
            <div style={{ ...row, flexWrap: "wrap" }}>
              <div style={{ minWidth: "120px" }}>
                <div style={labelStyle}>Phone</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Contact number
                </div>
              </div>
              {editingProfile ? (
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  style={{ ...inputStyle, maxWidth: "200px" }}
                />
              ) : (
                <div style={valueStyle}>
                  {savedProfile.phone ? (
                    <span style={{ color: text, fontWeight: 500 }}>
                      {savedProfile.phone}
                    </span>
                  ) : (
                    <span style={{ fontStyle: "italic" }}>Not set</span>
                  )}
                </div>
              )}
            </div>
            {editingProfile && !profileChanged && (
              <div
                style={{
                  margin: "0 24px 12px",
                  padding: "8px 12px",
                  background: isLight ? "#f8fafc" : "#13131f",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: muted,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="ti ti-info-circle" style={{ fontSize: "13px" }} />{" "}
                Make a change to enable saving
              </div>
            )}
            {profileSaved && (
              <div
                style={{
                  margin: "0 24px 16px",
                  padding: "10px 14px",
                  background: "#10b98112",
                  border: "1px solid #10b98130",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#10b981",
                  fontWeight: 500,
                }}
              >
                ✓ Profile updated successfully
              </div>
            )}
          </div>

          {/* Appearance */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                  Appearance
                </div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "1px" }}
                >
                  Customize how the app looks
                </div>
              </div>
            </div>
            <div style={{ ...row }}>
              <div>
                <div style={labelStyle}>Theme</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Currently {isLight ? "light" : "dark"} mode
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  background: isLight ? "#f1f5f9" : "#13131f",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  padding: "3px",
                  gap: "2px",
                  flexShrink: 0,
                }}
              >
                {[
                  { label: "Light", value: "light", icon: "ti-sun" },
                  { label: "Dark", value: "dark", icon: "ti-moon" },
                ].map((opt) => {
                  const active = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: active ? 600 : 400,
                        background: active
                          ? isLight
                            ? "#ffffff"
                            : "#1e1e2e"
                          : "transparent",
                        color: active ? "#6366f1" : muted,
                        boxShadow: active ? "0 1px 3px #00000015" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      <i
                        className={`ti ${opt.icon}`}
                        style={{ fontSize: "13px" }}
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* About */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                About
              </div>
            </div>
            {[
              { label: "Version", value: "1.0.0 Beta" },
              { label: "AI Model", value: "Llama 3.3 70B via Groq" },
              { label: "Built with", value: "React + Node.js + MongoDB" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  ...row,
                  borderBottom: i < 2 ? `1px solid ${rowBorder}` : "none",
                }}
              >
                <span style={valueStyle}>{item.label}</span>
                <span style={{ ...valueStyle, color: text, fontWeight: 500 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* Interview Preferences */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
                  Interview Preferences
                </div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "1px" }}
                >
                  Pre-fills your interview setup form
                </div>
              </div>
              <button
                onClick={savePrefs}
                disabled={savingPrefs || !prefsChanged}
                style={{
                  padding: "7px 16px",
                  background: prefsSaved
                    ? "#10b98120"
                    : !prefsChanged
                      ? isLight
                        ? "#e2e8f0"
                        : "#1e1e2e"
                      : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: prefsSaved ? "1px solid #10b98140" : "none",
                  borderRadius: "8px",
                  color: prefsSaved
                    ? "#10b981"
                    : !prefsChanged
                      ? muted
                      : "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor:
                    savingPrefs || !prefsChanged ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {!prefsChanged && !prefsSaved && (
                  <i className="ti ti-lock" style={{ fontSize: "11px" }} />
                )}
                {prefsSaved ? "✓ Saved" : savingPrefs ? "Saving..." : "Save"}
              </button>
            </div>
            <div
              style={{
                ...row,
                borderBottom: `1px solid ${rowBorder}`,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: "120px" }}>
                <div style={labelStyle}>Default Company</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Target company
                </div>
              </div>
              <input
                type="text"
                placeholder="e.g. Google"
                value={prefs.defaultCompany}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultCompany: e.target.value })
                }
                style={{ ...inputStyle, maxWidth: "200px" }}
              />
            </div>
            <div
              style={{
                ...row,
                borderBottom: `1px solid ${rowBorder}`,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: "120px" }}>
                <div style={labelStyle}>Target Role</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Role you're applying for
                </div>
              </div>
              <input
                type="text"
                placeholder="e.g. SDE Intern"
                value={prefs.defaultRole}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultRole: e.target.value })
                }
                style={{ ...inputStyle, maxWidth: "200px" }}
              />
            </div>
            <div style={{ ...row, flexWrap: "wrap" }}>
              <div style={{ minWidth: "120px" }}>
                <div style={labelStyle}>Default Round</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  Round type to start with
                </div>
              </div>
              <select
                value={prefs.defaultRound}
                onChange={(e) =>
                  setPrefs({ ...prefs, defaultRound: e.target.value })
                }
                style={{ ...inputStyle, maxWidth: "200px", cursor: "pointer" }}
              >
                {["DSA", "Technical", "HR", "System Design"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            {!prefsChanged && (
              <div
                style={{
                  margin: "0 24px 12px",
                  padding: "8px 12px",
                  background: isLight ? "#f8fafc" : "#13131f",
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: muted,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="ti ti-info-circle" style={{ fontSize: "13px" }} />{" "}
                Make a change to enable saving
              </div>
            )}
            {prefsSaved && (
              <div
                style={{
                  margin: "0 24px 16px",
                  padding: "10px 14px",
                  background: "#10b98112",
                  border: "1px solid #10b98130",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#10b981",
                  fontWeight: 500,
                }}
              >
                ✓ Preferences saved successfully
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div
            style={{
              background: isLight ? "#fff8f8" : "#0d0d1a",
              border: "1px solid #ef444420",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: shadow,
            }}
          >
            <div style={{ ...cardHeader, borderBottom: "1px solid #ef444420" }}>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ef4444",
                  }}
                >
                  Danger Zone
                </div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "1px" }}
                >
                  Irreversible actions
                </div>
              </div>
            </div>
            <div style={{ ...row }}>
              <div>
                <div style={labelStyle}>Sign out</div>
                <div
                  style={{ fontSize: "12px", color: muted, marginTop: "2px" }}
                >
                  You'll need to sign in again.
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 18px",
                  background: "#ef444415",
                  border: "1px solid #ef444430",
                  borderRadius: "8px",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
