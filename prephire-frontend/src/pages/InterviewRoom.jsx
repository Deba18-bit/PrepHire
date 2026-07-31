import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function InterviewSetup() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [interviewFocus, setInterviewFocus] = useState("System Design & Architecture");
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("target_role", targetRole);
    formData.append("experience_level", experienceLevel);
    formData.append("interview_focus", interviewFocus);
    if (resumeFile) {
      formData.append("resume_file", resumeFile);
    }

    try {
      // Calls your FastAPI backend endpoint (/api/interview/start)
      const res = await api.post("/api/interview/start", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      // ─── NAVIGATE TO INTERVIEW ROOM WITH AUDIO PAYLOAD ───
      navigate("/interview-room", {
        state: {
          sessionId: data.session_id,
          initialMessage: data.ai_message,
          initialAudio: data.audio_base64, // Passes Edge-TTS base64 audio stream
          role: targetRole,
        },
      });

    } catch (err) {
      console.error("Setup Error:", err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to start interview session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "60px 24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 600, background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 20, padding: "40px" }}>
        
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Mock Interview Setup</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Configure your parameters before entering the interview room.</p>

        {errorMessage && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 24 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Target Role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Role</label>
            <input 
              type="text" 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              required
              placeholder="e.g. Senior Frontend Engineer"
              style={{ background: "#141414", border: "1px solid #262626", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, outline: "none" }}
            />
          </div>

          {/* Experience Level */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience Level</label>
            <select 
              value={experienceLevel} 
              onChange={(e) => setExperienceLevel(e.target.value)}
              style={{ background: "#141414", border: "1px solid #262626", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, outline: "none" }}
            >
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid-Level">Mid-Level (3-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
              <option value="Staff/Principal">Staff / Principal</option>
            </select>
          </div>

          {/* Interview Focus */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Interview Focus</label>
            <select 
              value={interviewFocus} 
              onChange={(e) => setInterviewFocus(e.target.value)}
              style={{ background: "#141414", border: "1px solid #262626", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 15, outline: "none" }}
            >
              <option value="System Design & Architecture">System Design & Architecture</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Behavioral & Leadership">Behavioral & Leadership</option>
              <option value="Full Stack Technical Deep Dive">Full Stack Technical Deep Dive</option>
            </select>
          </div>

          {/* Resume Upload (Optional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume (Optional)</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              style={{ background: "#141414", border: "1px solid #262626", borderRadius: 10, padding: "12px", color: "#888", fontSize: 14, outline: "none" }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 12,
              background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
              border: "none", color: "#fff", padding: "16px", borderRadius: 10,
              fontSize: 16, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1, boxShadow: "0 4px 20px rgba(79,126,255,0.3)"
            }}
          >
            {isLoading ? "Preparing Interview Room & Audio..." : "Start Live Interview →"}
          </button>

        </form>

      </div>
    </div>
  );
}