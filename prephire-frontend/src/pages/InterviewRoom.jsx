import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "regenerator-runtime/runtime"; 
import api from "../services/api"; // Import your central API helper

export default function InterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { sessionId, initialMessage, role } = location.state || {};

  // ── State Management ──
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: "ai", text: initialMessage || "Hello! I am your AI Interviewer. Let's begin." }
  ]);
  
  const chatEndRef = useRef(null);

  // ── 1. Force Browser to Load Voices Safely ──
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // ── 2. TEXT-TO-SPEECH (Cross-Browser Safe Fallback) ──
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices() || [];
      
      const premiumVoice = voices.find(v => 
        v.name.includes("Google US English") ||
        v.name.includes("Microsoft Zira") ||
        v.name.includes("Microsoft David") ||
        v.name.includes("Samantha") || 
        v.name.includes("Daniel") ||   
        v.name.includes("Alex") ||     
        v.name.includes("Karen") ||
        v.lang === "en-US" || 
        v.lang === "en-GB"
      );

      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }

      utterance.rate = 1.0;  
      utterance.pitch = 1.0; 
      
      // Catch browser blocking (common in Brave/Chrome autoplay restrictions)
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error or blocked by browser restriction:", e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis unavailable:", err);
    }
  };

  // Safe initial speech execution
  useEffect(() => {
    if (!initialMessage) return;

    const timer = setTimeout(() => {
      speakText(initialMessage);
    }, 300);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
    };
  }, [initialMessage]);

  useEffect(() => {
    if (!sessionId) navigate("/interview-setup");
  }, [sessionId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // ── Speech Recognition Hook ──
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening) {
      setAnswerText(transcript);
    }
  }, [transcript, listening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center", background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "40px", borderRadius: "16px", maxWidth: "500px" }}>
          <h2 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700 }}>Microphone Not Supported</h2>
          <p style={{ color: "#888", marginBottom: 24, lineHeight: 1.6 }}>Your current browser does not support the web speech API required for live interviews. Please switch to <b>Google Chrome</b> to use this feature.</p>
          <button 
            onClick={() => navigate("/dashboard")}
            style={{ background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleStartSpeaking = () => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    resetTranscript();
    setAnswerText("");
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopSpeaking = () => {
    SpeechRecognition.stopListening();
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    
    SpeechRecognition.stopListening();
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }

    const userMessage = answerText;
    setChatLog((prev) => [...prev, { sender: "user", text: userMessage }]);
    setAnswerText("");
    resetTranscript();
    setIsAIThinking(true);
    
    try {
      // Use your central api instance instead of raw fetch
      const res = await api.post("/api/interview/reply", {
        session_id: sessionId,
        answer_text: userMessage
      });

      const data = res.data;

      // ─── AUTO-REDIRECT LOGIC: Check for completion tag ───
      if (data.ai_message.includes("[INTERVIEW_COMPLETE]")) {
        const cleanMessage = data.ai_message.replace("[INTERVIEW_COMPLETE]", "").trim();
        
        setChatLog((prev) => [...prev, { sender: "ai", text: cleanMessage }]);
        speakText(cleanMessage);
        
        setTimeout(() => {
          navigate(`/interview-report/${sessionId}`);
        }, 8500); 
        
        return; 
      }

      // ─── STANDARD CHAT LOGIC ───
      setChatLog((prev) => [...prev, { sender: "ai", text: data.ai_message }]);
      speakText(data.ai_message);

    } catch (error) {
      console.error("Interview Error:", error);
      const errorMsg = "I'm having trouble connecting right now. Could you repeat that?";
      setChatLog((prev) => [...prev, { sender: "ai", text: errorMsg }]);
      speakText(errorMsg);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleEndInterview = () => {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    if (window.confirm("Are you sure you want to end the interview early?")) {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header with Voice Replay Control for Browser Security Compliance */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a", paddingBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Live Interview</h1>
            <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>Role: {role || "Candidate"}</p>
          </div>
          
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button 
              onClick={() => speakText(chatLog[chatLog.length - 1]?.text || initialMessage)}
              style={{ background: "rgba(139, 92, 246, 0.15)", border: "1px solid #8B5CF6", color: "#C084FC", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              title="Click to play/replay AI audio"
            >
              🔊 Replay AI Audio
            </button>

            <button 
              onClick={handleEndInterview}
              style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ff6b6b", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Chat History Window */}
        <div style={{ 
          background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 16, padding: "24px",
          height: "50vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 
        }}>
          {chatLog.map((msg, index) => (
            <div key={index} style={{
              display: "flex", 
              flexDirection: msg.sender === "user" ? "row-reverse" : "row",
              gap: 12,
              alignItems: "flex-start"
            }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: msg.sender === "user" ? "#222" : "linear-gradient(135deg, #4F7EFF, #8B5CF6)", 
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 
              }}>
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div style={{
                background: msg.sender === "user" ? "#1a1a1a" : "rgba(79,126,255,0.08)",
                border: msg.sender === "user" ? "1px solid #333" : "1px solid rgba(79,126,255,0.2)",
                padding: "14px 18px",
                borderRadius: 16,
                borderTopLeftRadius: msg.sender === "ai" ? 4 : 16,
                borderTopRightRadius: msg.sender === "user" ? 4 : 16,
                maxWidth: "80%",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#eee"
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAIThinking && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ padding: "14px 18px", color: "#888", fontSize: 14, fontStyle: "italic" }}>
                Interviewer is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* User Answer Input Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Response
          </label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isAIThinking}
            placeholder={isAIThinking ? "Wait for the interviewer to finish..." : "Start speaking, or type your answer here..."}
            style={{
              width: "100%", height: 120, background: "#0c0c0c", border: "1px solid #222",
              borderRadius: 12, padding: 16, color: "#fff", fontSize: 15, lineHeight: 1.6,
              resize: "none", outline: "none", fontFamily: "inherit",
              opacity: isAIThinking ? 0.5 : 1
            }}
            onFocus={(e) => e.target.style.borderColor = "#4F7EFF"}
            onBlur={(e) => e.target.style.borderColor = "#222"}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              {!listening ? (
                <button
                  onClick={handleStartSpeaking}
                  disabled={isAIThinking}
                  style={{ 
                    background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", 
                    color: "#ef4444", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, 
                    cursor: isAIThinking ? "not-allowed" : "pointer", opacity: isAIThinking ? 0.5 : 1 
                  }}
                >
                  🎤 Start Speaking
                </button>
              ) : (
                <button
                  onClick={handleStopSpeaking}
                  style={{ 
                    background: "#ef4444", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, 
                    fontSize: 14, fontWeight: 600, cursor: "pointer", animation: "pulse 1.5s infinite" 
                  }}
                >
                  ⏹ Stop Recording
                </button>
              )}
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={isAIThinking || !answerText.trim()}
              style={{
                background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", border: "none", color: "#fff",
                padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, 
                cursor: (isAIThinking || !answerText.trim()) ? "not-allowed" : "pointer",
                opacity: (isAIThinking || !answerText.trim()) ? 0.5 : 1,
                boxShadow: (isAIThinking || !answerText.trim()) ? "none" : "0 4px 15px rgba(79,126,255,0.3)"
              }}
            >
              Submit Answer →
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}