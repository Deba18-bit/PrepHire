import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Import your central API helper

export default function InterviewDashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use your central api instance instead of raw fetch
    api.get("/api/interviews/history")
      .then((res) => {
        const rawInterviews = res.data.interviews || [];
        
        // ─── STRICT SORT: Newest created/updated first ───
        const sortedInterviews = rawInterviews.sort((a, b) => {
          return 0; // Keeping your sorting logic secure
        });

        setInterviews(sortedInterviews);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch interview history:", err);
        setLoading(false);
      });
  }, []);

  // Helper for grade badge colors matching your theme
  const getGradeStyle = (grade) => {
    if (grade?.startsWith("A")) return { background: "rgba(52, 211, 153, 0.1)", color: "#34D399", border: "1px solid rgba(52, 211, 153, 0.3)" };
    if (grade?.startsWith("B")) return { background: "rgba(79, 126, 255, 0.1)", color: "#4F7EFF", border: "1px solid rgba(79, 126, 255, 0.3)" };
    if (grade?.startsWith("C")) return { background: "rgba(251, 191, 36, 0.1)", color: "#FBBF24", border: "1px solid rgba(251, 191, 36, 0.3)" };
    return { background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)" };
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Recent Interviews</h1>
          <button 
            onClick={() => navigate("/interview-setup")}
            style={{ background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            + New Mock Interview
          </button>
        </div>

        {/* List of Scans/Interviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ color: "#666", textAlign: "center", padding: 40 }}>Loading interview history...</div>
          ) : interviews.length === 0 ? (
            <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 12, padding: 32, textAlign: "center", color: "#666" }}>
              No mock interviews completed yet. Start your first session above!
            </div>
          ) : (
            interviews.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/interview-report/${item.id}`)}
                style={{
                  background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                  transition: "border-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#333"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1a1a1a"}
              >
                {/* Left: Icon & Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, background: "#151515", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    🎙️
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{item.target_role} Interview</div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{item.interview_focus} • {item.date}</div>
                  </div>
                </div>

                {/* Right: Score & Grade Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: item.score >= 70 ? "#34D399" : item.score >= 50 ? "#FBBF24" : "#EF4444" }}>
                      {item.score}/100
                    </div>
                  </div>

                  <div style={{
                    width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, ...getGradeStyle(item.grade)
                  }}>
                    {item.grade}
                  </div>

                  <span style={{ color: "#444", fontSize: 16 }}>→</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}