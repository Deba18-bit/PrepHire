import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Entry Level");
  const [focus, setFocus] = useState("Technical & Coding");
  const [loading, setLoading] = useState(false);

  const handleStart = (e) => {
    e.preventDefault();
    if (!role.trim()) return;
    
    setLoading(true);
    // Simulate API delay for creating the interview session
    setTimeout(() => {
      navigate("/interview-session", { 
        state: { role, experience, focus } 
      });
    }, 1200);
  };

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
      display: "flex", flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .input-field {
          background: #0f0f0f;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .input-field:focus { border-color: #8B5CF6; }
        
        .pill-btn {
          background: #0f0f0f;
          border: 1px solid #222;
          color: #888;
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .pill-btn.active {
          background: rgba(139,92,246,0.1);
          border-color: #8B5CF6;
          color: #8B5CF6;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #4F7EFF, #8B5CF6);
          color: #fff; border: none;
          padding: 16px; border-radius: 12px;
          font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: transform 0.2s, opacity 0.2s;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      {/* Simple Top Nav */}
      <nav style={{ padding: "24px 40px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent", border: "1px solid #222",
            color: "#888", padding: "8px 16px", borderRadius: 8,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#444"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#222"; }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px 40px" }}>
        <div style={{
          width: "100%", maxWidth: 540,
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 24,
          padding: 40,
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Ambient Glow */}
          <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "rgba(139,92,246,0.15)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
              🎙️
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>
              Configure Session
            </h1>
            <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6 }}>
              Customize your AI interviewer. We'll generate industry-standard questions based on these parameters.
            </p>
          </div>

          <form onSubmit={handleStart} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            
            {/* Target Role */}
            <div>
              <label style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Target Role
              </label>
              <input
                className="input-field"
                placeholder="e.g., Full Stack Developer, Product Manager"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Experience Level */}
            <div>
              <label style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Experience Level
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["Internship", "Entry Level", "Mid Level", "Senior"].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`pill-btn ${experience === lvl ? "active" : ""}`}
                    onClick={() => setExperience(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Area */}
            <div>
              <label style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Interview Focus
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["Technical & Coding", "System Design", "Behavioral & HR", "Mixed / General"].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`pill-btn ${focus === f ? "active" : ""}`}
                    onClick={() => setFocus(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: 8 }}>
              <button className="btn-primary" type="submit" disabled={loading || !role.trim()}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ animation: "spin 1s linear infinite" }}>⚙️</span> Generating Session...
                  </span>
                ) : (
                  "Start Interview →"
                )}
              </button>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}