import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewSetup() {
  const navigate = useNavigate();

  // ── Form States ──
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [interviewFocus, setInterviewFocus] = useState("Technical & Coding");
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fixed Target Role Options (Prevents Vague Inputs & Token Waste) ──
  const roleOptions = [
    "Full Stack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "Data Scientist / AI Engineer",
    "DevOps & Cloud Engineer",
    "Mobile App Developer (React Native / Flutter)",
    "Systems & Embedded Engineer",
    "Cybersecurity Analyst",
  ];

  const experienceOptions = ["Internship", "Entry Level", "Mid Level", "Senior"];

  const focusOptions = [
    "Technical & Coding",
    "System Design",
    "Behavioral & HR",
    "Mixed / General",
  ];

  // ── Handlers ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        alert("Please upload a valid PDF file.");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Prepare payload as FormData to handle the optional file
      const formData = new FormData();
      formData.append("target_role", targetRole);
      formData.append("experience_level", experienceLevel);
      formData.append("interview_focus", interviewFocus);
      
      if (resumeFile) {
        formData.append("resume_file", resumeFile);
      }

      // 2. Send request to FastAPI backend
      const response = await fetch("http://localhost:8000/api/interview/start", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}` // Ensure auth is passed
        }
      });

      // Parse response first so we can read the backend's exact error details
      const data = await response.json();

      // ─── PAYWALL & ERROR HANDLING ───
      if (!response.ok) {
        if (response.status === 403) {
          // This gracefully catches the Free/Pro limit error from the backend
          alert(`💎 Limit Reached: ${data.detail}\n\nPlease upgrade your plan to continue practicing.`);
          // navigate("/pricing"); // You can uncomment this later to auto-redirect to a pricing page
          return;
        }
        throw new Error(data.detail || "Failed to start session");
      }

      // 3. Navigate to the room, passing the backend's response data
      navigate("/interview-room", { 
        state: { 
          sessionId: data.session_id,
          initialMessage: data.ai_message,
          role: targetRole 
        } 
      });

    } catch (error) {
      console.error("Error starting interview:", error);
      alert(error.message || "Could not connect to the AI interviewer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#08080c",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "absolute",
          top: 32,
          left: 40,
          background: "transparent",
          border: "1px solid #1a1a24",
          color: "#888",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "#333";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#888";
          e.currentTarget.style.borderColor = "#1a1a24";
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Main Configuration Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "linear-gradient(180deg, #11111a 0%, #0b0b12 100%)",
          border: "1px solid #1f1f2e",
          borderRadius: 24,
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(139, 92, 246, 0.12)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 20,
            color: "#8B5CF6",
          }}
        >
          🎙️
        </div>

        {/* Title & Subtitle */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: 8,
          }}
        >
          Configure Session
        </h1>
        <p
          style={{
            color: "#666680",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 32,
          }}
        >
          Customize your AI interviewer. We'll generate industry-standard
          questions based on these parameters.
        </p>

        <form onSubmit={handleStartSession} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* 1. TARGET ROLE (Fixed Dropdown) */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#777799",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                width: "100%",
                background: "#0d0d14",
                border: "1px solid #222233",
                borderRadius: 12,
                padding: "14px 16px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%238888aa" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role} style={{ background: "#11111a", color: "#fff" }}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* 2. EXPERIENCE LEVEL (Interactive Pills) */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#777799",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Experience Level
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {experienceOptions.map((level) => {
                const isSelected = experienceLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperienceLevel(level)}
                    style={{
                      background: isSelected ? "rgba(139, 92, 246, 0.15)" : "#0d0d14",
                      border: `1px solid ${isSelected ? "#8B5CF6" : "#1f1f2e"}`,
                      color: isSelected ? "#fff" : "#777799",
                      padding: "10px 18px",
                      borderRadius: 100,
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. INTERVIEW FOCUS (Interactive Pills) */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#777799",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Interview Focus
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {focusOptions.map((focus) => {
                const isSelected = interviewFocus === focus;
                return (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => setInterviewFocus(focus)}
                    style={{
                      background: isSelected ? "rgba(139, 92, 246, 0.15)" : "#0d0d14",
                      border: `1px solid ${isSelected ? "#8B5CF6" : "#1f1f2e"}`,
                      color: isSelected ? "#fff" : "#777799",
                      padding: "10px 18px",
                      borderRadius: 100,
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {focus}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CV UPLOAD CENTER (Optional for Precision Grounding) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#777799",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Attach CV / Resume <span style={{ color: "#555577", fontWeight: 400 }}>(Optional)</span>
              </label>
            </div>

            {!resumeFile ? (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "20px",
                  background: "#0d0d14",
                  border: "1px dashed #28283a",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#28283a")}
              >
                <span style={{ fontSize: 20 }}>📄</span>
                <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>
                  Click to upload PDF resume for personal grounding
                </span>
                <span style={{ fontSize: 11, color: "#555577", marginBottom: 4 }}>Max size: 5MB</span>
                
                {/* Highlighted text to encourage users to upload their CV */}
                <span style={{ fontSize: 11, color: "#8B5CF6", fontStyle: "italic", textAlign: "center", maxWidth: "80%" }}>
                  💡 Highly recommended! The AI will read your resume to ask hyper-specific questions about your past projects.
                </span>

                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <span style={{ fontSize: 18 }}>📌</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 260,
                    }}
                  >
                    {resumeFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    fontSize: 16,
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                  title="Remove CV"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* CTA Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background: isSubmitting
                ? "#222233"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: isSubmitting ? "#777799" : "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: isSubmitting ? "none" : "0 8px 25px rgba(139, 92, 246, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {isSubmitting ? "Generating AI Session..." : "Start AI Voice Interview →"}
          </button>
        </form>
      </div>
    </div>
  );
}