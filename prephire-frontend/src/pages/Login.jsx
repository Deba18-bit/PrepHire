import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify({
        user_id: res.data.user_id,
        full_name: res.data.full_name,
        plan: res.data.plan,
      }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
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
          Welcome back
        </h1>
        <p style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>
          Continue your interview preparation
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: "#666" }}>Password</label>
              <span style={{ fontSize: 13, color: "#4F7EFF", cursor: "pointer" }}>Forgot password?</span>
            </div>
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
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#555" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#4F7EFF", textDecoration: "none", fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}