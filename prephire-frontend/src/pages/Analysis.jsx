import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalysis } from "../services/api";

export default function Analysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [loading, setLoading] = useState(!analysis);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (!analysis) {
      getAnalysis(id)
        .then(res => setAnalysis(res.data.full_analysis))
        .catch(() => navigate("/dashboard"))
        .finally(() => setLoading(false));
    }
  }, [analysis, id, navigate]);

  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "#22c55e";
    if (pct >= 60) return "#4F7EFF";
    if (pct >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getGradeColor = (grade) => {
    if (!grade) return "#555";
    if (grade.startsWith("A")) return "#22c55e";
    if (grade.startsWith("B")) return "#4F7EFF";
    if (grade.startsWith("C")) return "#f59e0b";
    return "#ef4444";
  };

  const pillarLabels = {
    pillar_1_design_ats: "Design & ATS Inspector",
    pillar_2_credentials: "Credential Auditor",
    pillar_3_experience: "Experience & Impact",
    pillar_4_future_proof: "Future-Proof Calculator",
    pillar_5_projects: "Technical Project Validator",
  };

  if (loading) return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
    }}>
      <p style={{ color: "#555" }}>Loading analysis...</p>
    </div>
  );

  if (!analysis) return null;

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #111",
        position: "sticky", top: 0, background: "#080808", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "#fff",
          }}>PH</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>PrepHire</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent", border: "1px solid #1a1a1a",
            color: "#666", padding: "6px 14px", borderRadius: 8,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Slide-Over Market Intelligence Drawer */}
        {showDrawer && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 1000,
              display: "flex",
              justifyContent: "flex-end",
            }}
            onClick={() => setShowDrawer(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "100%",
                background: "#0c0c0c",
                borderLeft: "1px solid #1f1f1f",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                overflowY: "auto",
                boxShadow: "-10px 0 30px rgba(0,0,0,0.8)"
              }}
              onClick={(e) => e.stopPropagation()} // Prevent clicking drawer from closing it
            >
              {/* Drawer Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
                    Live Market Sources
                  </h2>
                  <p style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                    Real-time web data retrieved for target role: <strong style={{ color: "#4F7EFF" }}>{analysis?.target_role}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  style={{
                    background: "#181818",
                    border: "1px solid #282828",
                    color: "#aaa",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Sources List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {analysis?.market_sources && analysis.market_sources.length > 0 ? (
                  analysis.market_sources.map((src, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#121212",
                        border: "1px solid #1c1c1c",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#8B5CF6",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase"
                        }}
                      >
                        {src.pillar?.replace(/PILLAR \d+ \((.*?)\)/i, "$1").replace(/PILLAR \d+ - /i, "")}
                      </span>
                      <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.5" }}>
                        "{src.snippet.length > 180 ? src.snippet.slice(0, 180) + "..." : src.snippet}"
                      </p>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#4F7EFF",
                          textDecoration: "none",
                          fontWeight: "600",
                          marginTop: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        Open Source Article ↗
                      </a>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
                    No external market sources were retrieved for this scan.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Updated Header with Right-Aligned Button */}
        <div style={{ 
          marginBottom: 32, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 6 }}>
              Resume Analysis Report
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
              {analysis.candidate_name}
            </h1>
            <p style={{ color: "#555", fontSize: 15 }}>
              Target Role: <strong style={{ color: "#aaa", fontWeight: 600 }}>{analysis.target_role || "Not specified"}</strong>
            </p>
          </div>

          {/* Sleek Market Intelligence Button */}
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              background: "#0f0f0f",
              border: "1px solid #222",
              color: "#4F7EFF",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4F7EFF";
              e.currentTarget.style.background = "rgba(79, 126, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#222";
              e.currentTarget.style.background = "#0f0f0f";
            }}
          >
            <span style={{ fontSize: "14px" }}>🌐</span>
            <span>Live Market Intelligence</span>
            <span style={{
              background: "rgba(79, 126, 255, 0.15)",
              color: "#4F7EFF",
              padding: "2px 8px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700
            }}>
              {analysis?.market_sources?.length || 0} Sources
            </span>
          </button>
        </div>

        {/* Score Card */}
        <div style={{
          background: "#0f0f0f", border: "1px solid #1a1a1a",
          borderRadius: 16, padding: 32, marginBottom: 24,
          display: "flex", alignItems: "center", gap: 32,
          flexWrap: "wrap",
        }}>
          {/* Big Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 72, fontWeight: 800, letterSpacing: "-2px",
              color: getScoreColor(analysis.overall_score, 100),
              lineHeight: 1,
            }}>
              {analysis.overall_score}
            </div>
            <div style={{ color: "#444", fontSize: 14, marginTop: 4 }}>out of 100</div>
          </div>

          {/* Grade */}
          <div style={{
            width: 64, height: 64, borderRadius: 12,
            background: `${getGradeColor(analysis.grade)}15`,
            border: `1px solid ${getGradeColor(analysis.grade)}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800,
            color: getGradeColor(analysis.grade),
          }}>
            {analysis.grade}
          </div>

          {/* Score bar */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 10 }}>Overall Score</div>
            <div style={{ height: 8, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${getScoreColor(analysis.overall_score, 100)}, ${getScoreColor(analysis.overall_score, 100)}88)`,
                width: `${analysis.overall_score}%`,
                transition: "width 1s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ color: "#444", fontSize: 12 }}>0</span>
              <span style={{ color: "#444", fontSize: 12 }}>100</span>
            </div>
          </div>
        </div>

        {/* Top Priority Fix */}
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f59e0b", marginBottom: 4 }}>
              Top Priority Fix
            </div>
            <div style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>
              {analysis.top_priority_fix}
            </div>
          </div>
        </div>

        {/* Pillars */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Pillar Breakdown</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {analysis.pillars && Object.entries(analysis.pillars).map(([key, pillar]) => (
            <div key={key} style={{
              background: "#0f0f0f", border: "1px solid #1a1a1a",
              borderRadius: 12, padding: 24,
            }}>
              {/* Pillar header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {pillarLabels[key] || key}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontSize: 20, fontWeight: 800,
                    color: getScoreColor(pillar.score, pillar.max_score),
                  }}>
                    {pillar.score}
                    <span style={{ fontSize: 13, color: "#444", fontWeight: 400 }}>/{pillar.max_score}</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: getScoreColor(pillar.score, pillar.max_score),
                  width: `${(pillar.score / pillar.max_score) * 100}%`,
                  transition: "width 1s ease",
                }} />
              </div>

              {/* Reason */}
              <p style={{ color: "#666", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                {pillar.reason}
              </p>

              {/* Improvements */}
              {pillar.improvements?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: "#444", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
                    Improvements
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {pillar.improvements.map((imp, i) => (
                      <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#888" }}>
                        <span style={{ color: "#4F7EFF", marginTop: 1, flexShrink: 0 }}>→</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div style={{
          background: "#0f0f0f", border: "1px solid #1a1a1a",
          borderRadius: 12, padding: 24, marginBottom: 32,
        }}>
          <div style={{ fontSize: 12, color: "#444", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>
            Overall Verdict
          </div>
          <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.8 }}>
            {analysis.verdict}
          </p>
        </div>

        {/* Bottom buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
              color: "#fff", border: "none",
              padding: "12px 24px", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Analyze Another Resume
          </button>
          <button
            style={{
              background: "transparent",
              border: "1px solid #1a1a1a",
              color: "#666", padding: "12px 24px", borderRadius: 8,
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Practice Interview(Coming Soon) →
          </button>
        </div>
      </div>
    </div>
  );
}