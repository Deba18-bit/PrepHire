import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // loading, success, or error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    const verifyToken = async () => {
      try {
        // Send the token to your FastAPI backend
        const response = await axios.post(`http://localhost:8000/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email successfully verified!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Invalid or expired link. Please sign up again.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "#0f0f0f", border: "1px solid #1a1a1a",
        borderRadius: 16, padding: "40px 36px", textAlign: "center"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#fff",
          }}>PH</div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          {status === "loading" && "Verifying..."}
          {status === "success" && "Verification Complete"}
          {status === "error" && "Verification Failed"}
        </h2>

        <p style={{ color: status === "error" ? "#ff6b6b" : "#a1a1aa", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          {message}
        </p>

        {status !== "loading" && (
          <Link to="/login" style={{
            display: "inline-block", width: "100%",
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            color: "#fff", padding: "13px", borderRadius: "8px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none"
          }}>
            Proceed to Login →
          </Link>
        )}
      </div>
    </div>
  );
}