import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/api";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signup(form);
      // Save token and user info, then jump straight to dashboard!
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify({
        user_id: res.data.user_id,
        full_name: res.data.full_name,
        plan: res.data.plan,
      }));
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail[0].msg); 
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError("An unexpected error occurred.");
        }
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-field {
          width: 100%;
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #4F7EFF; }
        .input-field::placeholder { color: #444; }
        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #4F7EFF, #8B5CF6);
          color: #fff; border: none;
          padding: 13px; border-radius: 8px;
          font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.2s;
        }
        .btn-primary:hover { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 400,
        background: "#0f0f0f",
        border: "1px solid #1a1a1a",
        borderRadius: 16, padding: "40px 36px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
          }}>PH</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>PrepHire</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.5px" }}>
          Create your free account
        </h1>
        <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>
          3 free resume scans. No credit card needed.
        </p>

        <GoogleAuthButton />

        <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}></div>
          <span style={{ color: "#555", fontSize: 12, padding: "0 12px", fontWeight: 500 }}>OR CONTINUE WITH EMAIL</span>
          <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: "#666", marginBottom: 6, display: "block" }}>Full Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="Debarghya Samadder"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#666", marginBottom: 6, display: "block" }}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#666", marginBottom: 6, display: "block" }}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,59,59,0.08)",
              border: "1px solid rgba(255,59,59,0.2)",
              borderRadius: 8, padding: "10px 14px",
              color: "#ff6b6b", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p style={{ fontSize: 12, color: "#444", textAlign: "center", lineHeight: 1.6 }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#555" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4F7EFF", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}