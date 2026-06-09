import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, getMyAnalyses, uploadResume } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, analysesRes] = await Promise.all([getMe(), getMyAnalyses()]);
      setUser(meRes.data);
      setAnalyses(analysesRes.data.reverse());
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadResume(formData, targetRole);
      navigate(`/analysis/${res.data.id}`, { state: { analysis: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getGradeColor = (grade) => {
    if (!grade) return "#555";
    if (grade.startsWith("A")) return "#22c55e";
    if (grade.startsWith("B")) return "#4F7EFF";
    if (grade.startsWith("C")) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#4F7EFF";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
          margin: "0 auto 16px",
          animation: "pulse 1.5s ease infinite",
        }} />
        <p style={{ color: "#555", fontSize: 14 }}>Loading your workspace...</p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );

  return (
    <div
      style={{
        background: "#080808",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .action-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .action-card:hover {
          border-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(79,126,255,0.1);
        }
        
        .analysis-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px 24px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .analysis-card:hover { border-color: #333; transform: translateY(-2px); }
        
        .input-field {
          background: #080808;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .input-field:focus { border-color: #4F7EFF; }
        
        .btn-primary {
          background: linear-gradient(135deg, #4F7EFF, #8B5CF6);
          color: #fff; border: none;
          padding: 12px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Dropdown Styles */
        .profile-menu-container {
          position: relative;
          display: inline-block;
        }
        .profile-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 12px;
          width: 260px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.8);
          z-index: 1000;
        }
        .profile-menu-container:hover .profile-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .menu-item {
          padding: 12px 16px;
          cursor: pointer;
          color: #ccc;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s, color 0.2s;
          font-weight: 500;
        }
        .menu-item:hover {
          background: #1a1a1a;
          color: #fff;
        }
        .menu-divider {
          height: 1px;
          background: #1a1a1a;
          margin: 4px 0;
        }
      `}</style>

      {/* Navbar with Dropdown */}
      <nav
        style={{
          padding: "0 40px",
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #111",
          position: "sticky",
          top: 0,
          background: "rgba(8,8,8,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            PH
          </div>
          <span
            style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}
          >
            PrepHire
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Status Badge */}
          <div
            style={{
              background: "rgba(79,126,255,0.08)",
              border: "1px solid rgba(79,126,255,0.2)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 12,
              color: "#4F7EFF",
              fontWeight: 600,
            }}
          >
            {user?.plan === "free"
              ? `${user?.scan_count || 0}/3 Scans`
              : user?.plan === "pro"
                ? "Pro Plan ✓"
                : "Max Plan ✓"}
          </div>

          {/* Profile Hover Dropdown */}
          <div className="profile-menu-container">
            <button
              style={{
                background: "#0f0f0f",
                border: "1px solid #1a1a1a",
                color: "#eee",
                padding: "6px 12px 6px 6px",
                borderRadius: 100,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 500,
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span>{user?.full_name?.split(" ")[0] || "Profile"}</span>
              <span style={{ fontSize: 10, color: "#666", marginLeft: 4 }}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            <div className="profile-menu">
              <div
                style={{
                  padding: "20px 16px 16px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {user?.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#666",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {user?.email || "Signed in"}
                  </div>
                </div>
              </div>

              <div className="menu-divider" />

              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  Current Plan
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: user?.plan === "free" ? "#f59e0b" : "#4F7EFF",
                    fontWeight: 700,
                    background:
                      user?.plan === "free"
                        ? "rgba(245,158,11,0.1)"
                        : "rgba(79,126,255,0.1)",
                    padding: "4px 10px",
                    borderRadius: 100,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.plan || "Free"}
                </span>
              </div>

              <div className="menu-divider" />

              <div className="menu-item" onClick={() => navigate("/settings")}>
                <span style={{ fontSize: 16 }}>⚙️</span> Account Settings
              </div>

              {user?.plan !== "max" && (
                <div
                  className="menu-item"
                  onClick={() => navigate("/pricing")}
                  style={{ color: "#4F7EFF" }}
                >
                  <span style={{ fontSize: 16 }}>⚡</span>
                  {user?.plan === "free" ? "Upgrade to Pro" : "Upgrade to Max"}
                </div>
              )}

              <div className="menu-divider" />

              <div
                className="menu-item"
                onClick={handleLogout}
                style={{ color: "#ff6b6b" }}
              >
                <span style={{ fontSize: 16 }}>🚪</span> Sign out
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        {/* Welcome Section - Gradient Added */}
        <div style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            Welcome back,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {user?.full_name?.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          <p style={{ color: "#666", fontSize: 16 }}>
            What are we working on today?
          </p>
        </div>

        {/* Action Grid (Resume + Interview side-by-side) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {/* Action 1: Upload Resume */}
          <div className="action-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(79,126,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                📄
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                  Resume Analysis
                </h2>
                <p style={{ color: "#666", fontSize: 13 }}>
                  Get AI feedback and ATS scoring.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 6,
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Target Role
              </label>
              <input
                className="input-field"
                placeholder="e.g. Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleUpload(e.dataTransfer.files[0]);
              }}
              style={{
                border: `1px dashed ${dragOver ? "#4F7EFF" : "#222"}`,
                borderRadius: 12,
                padding: "32px 24px",
                textAlign: "center",
                transition: "all 0.2s",
                background: dragOver ? "rgba(79,126,255,0.05)" : "#080808",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("resume-upload").click()}
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => handleUpload(e.target.files[0])}
              />

              {uploading ? (
                <div>
                  <div
                    style={{
                      width: "100%",
                      height: 3,
                      background: "#1a1a1a",
                      borderRadius: 4,
                      margin: "0 auto 16px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #4F7EFF, #8B5CF6)",
                        animation: "analyzing 2s ease infinite",
                        width: "60%",
                      }}
                    />
                  </div>
                  <p style={{ color: "#888", fontSize: 13, fontWeight: 500 }}>
                    Scanning document...
                  </p>
                  <style>{`@keyframes analyzing { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }`}</style>
                </div>
              ) : (
                <div>
                  <div
                    style={{ fontWeight: 600, color: "#eee", marginBottom: 4 }}
                  >
                    Click to upload or drag and drop
                  </div>
                  <div style={{ color: "#555", fontSize: 12 }}>
                    PDF format only
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 12 }}>
                {error}
              </div>
            )}
          </div>

          {/* Action 2: Interview Practice */}
          <div
            className="action-card"
            style={{
              border: "1px solid rgba(139,92,246,0.3)",
              background:
                "linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(20,15,30,0.5) 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 150,
                height: 150,
                background: "rgba(139,92,246,0.1)",
                filter: "blur(60px)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(139,92,246,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🎙️
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                  AI Interview Coach
                </h2>
                <p style={{ color: "#666", fontSize: 13 }}>
                  Simulate real technical interviews.
                </p>
              </div>
            </div>

            <p
              style={{
                color: "#aaa",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Skip the resume upload. Tell us your target role and experience
              level, and our AI will conduct a live, interactive interview
              tailored exactly to your field.
            </p>

            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {[
                "Industry-specific questions",
                "Real-time answer scoring",
                "Actionable feedback",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "rgba(139,92,246,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8B5CF6",
                      fontSize: 10,
                    }}
                  >
                    ✓
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: 15 }}
              onClick={() => navigate("/interview-setup")}
            >
              Start Practice Session →
            </button>
          </div>
        </div>

        {/* Past Analyses */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Recent Scans</h2>
          </div>

          {analyses.length === 0 ? (
            <div
              style={{
                background: "#0f0f0f",
                border: "1px dashed #222",
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#444", fontSize: 14 }}>
                No history found. Upload a resume to see it here.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analyses.map((a) => (
                <div
                  key={a.id}
                  className="analysis-card"
                  onClick={() =>
                    navigate(`/analysis/${a.id}`, {
                      state: { analysis: a.full_analysis },
                    })
                  }
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "#1a1a1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      📄
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 4,
                          fontSize: 15,
                          color: "#eee",
                        }}
                      >
                        {a.filename}
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        {a.target_role} ·{" "}
                        {new Date(a.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 24 }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#666",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 2,
                        }}
                      >
                        Match
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: getScoreColor(a.overall_score),
                        }}
                      >
                        {a.overall_score}
                        <span
                          style={{
                            fontSize: 12,
                            color: "#444",
                            fontWeight: 400,
                          }}
                        >
                          /100
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${getGradeColor(a.grade)}15`,
                        border: `1px solid ${getGradeColor(a.grade)}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 800,
                        color: getGradeColor(a.grade),
                      }}
                    >
                      {a.grade}
                    </div>
                    <span style={{ color: "#333", fontSize: 18 }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid #111",
          padding: "60px 40px 40px",
          marginTop: 80,
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "40px 80px",
              marginBottom: 60,
            }}
          >
            {/* Brand */}
            <div style={{ flex: "1 1 250px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  PH
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
                  PrepHire
                </span>
              </div>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>
                AI-powered interview and resume coaching. Stop guessing, start
                preparing, and land your next role.
              </p>
            </div>

            {/* Links Columns */}
            <div style={{ flex: "1 1 120px" }}>
              <h4
                style={{
                  color: "#eee",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                Product
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {["Resume Scanner", "AI Interview", "Pricing", "Changelog"].map(
                  (link) => (
                    <span
                      key={link}
                      style={{
                        color: "#888",
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.color = "#fff")}
                      onMouseOut={(e) => (e.target.style.color = "#888")}
                    >
                      {link}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div style={{ flex: "1 1 120px" }}>
              <h4
                style={{
                  color: "#eee",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                Support
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  "Help Center",
                  "Contact Us",
                  "System Status",
                  "Community",
                ].map((link) => (
                  <span
                    key={link}
                    style={{
                      color: "#888",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#fff")}
                    onMouseOut={(e) => (e.target.style.color = "#888")}
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ flex: "1 1 120px" }}>
              <h4
                style={{
                  color: "#eee",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                Legal
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "Security",
                ].map((link) => (
                  <span
                    key={link}
                    style={{
                      color: "#888",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#fff")}
                    onMouseOut={(e) => (e.target.style.color = "#888")}
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 24,
              borderTop: "1px solid #1a1a1a",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ color: "#555", fontSize: 13 }}>
              © {new Date().getFullYear()} PrepHire. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <span
                style={{
                  color: "#555",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.color = "#fff")}
                onMouseOut={(e) => (e.target.style.color = "#555")}
              >
                𝕏 (Twitter)
              </span>
              <span
                style={{
                  color: "#555",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.color = "#fff")}
                onMouseOut={(e) => (e.target.style.color = "#555")}
              >
                LinkedIn
              </span>
              <span
                style={{
                  color: "#555",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.color = "#fff")}
                onMouseOut={(e) => (e.target.style.color = "#555")}
              >
                GitHub
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}