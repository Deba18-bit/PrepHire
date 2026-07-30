import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/interviews/report/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load interview report:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ background: "#080808", minHeight: "100vh", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading report...</div>;
  }

  if (!report) {
    return <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>Report not found.</div>;
  }

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/interviews")}
          style={{ background: "transparent", border: "1px solid #222", color: "#aaa", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, width: "fit-content", fontWeight: 600 }}
        >
          ← Back to Dashboard
        </button>

        {/* Top Header Card */}
        <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interview Performance Report</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{report.target_role}</h1>
            <p style={{ color: "#888", fontSize: 14, marginTop: 2 }}>Focus: {report.interview_focus} • {report.experience_level}</p>
          </div>

          {/* Overall Score Box */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#151515", padding: "20px 24px", borderRadius: 12, border: "1px solid #222" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: "#4F7EFF" }}>{report.score}</span>
              <span style={{ color: "#666", fontSize: 15 }}>out of 100</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, background: "rgba(79, 126, 255, 0.15)", color: "#4F7EFF", padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(79, 126, 255, 0.3)" }}>
              {report.grade}
            </div>
          </div>
        </div>

        {/* Top Priority Fix / Summary */}
        <div style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: 16, padding: "24px" }}>
          <div style={{ fontSize: 13, color: "#FBBF24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            ⚡ Key Area for Improvement
          </div>
          <p style={{ color: "#ddd", fontSize: 15, lineHeight: 1.6 }}>{report.top_priority_fix}</p>
        </div>

        {/* Pillar Breakdown */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Pillar Breakdown</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {report.pillars?.map((pillar, idx) => (
            <div key={idx} style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{pillar.name}</h3>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#4F7EFF" }}>{pillar.score} / {pillar.max_score}</span>
              </div>
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.5 }}>{pillar.comment}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}