import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMe } from "../services/api";

export default function Pricing() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then(res => setCurrentPlan(res.data.plan))
        .catch(() => setCurrentPlan(null));
    }
  }, []);

  const planOrder = ["free", "pro", "max"];

  const getButtonText = (planName) => {
    const name = planName.toLowerCase();
    if (!currentPlan) return `Get ${planName}`;
    if (name === currentPlan) return "Current Plan";
    if (planOrder.indexOf(name) > planOrder.indexOf(currentPlan)) return `Upgrade to ${planName}`;
    return `Downgrade to ${planName}`;
  };

  const isCurrentPlan = (planName) => planName.toLowerCase() === currentPlan;

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      desc: "Get started with the basics.",
      features: [
        "3 resume scans / month",
        "2 interview sessions / month",
        "Full 5-pillar analysis",
        "Score history",
        "Requires account"
      ],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹299",
      period: "/ month",
      desc: "For serious job seekers.",
      features: [
        "Unlimited resume scans",
        "15 interview sessions",
        "RAG-powered live market analysis",
        "Cover letter analyzer",
        "Priority support"
      ],
      highlight: true,
    },
    {
      name: "Max",
      price: "₹599",
      period: "/ month",
      desc: "For placement cells & coaches.",
      features: [
        "Unlimited interviews + bulk mode",
        "Bulk resume analysis",
        "Team dashboard",
        "Export reports as PDF",
        "Dedicated support"
      ],
      highlight: false,
    }
  ];

  return (
    <div style={{
      background: "#080808", minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
      display: "flex", flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pricing-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 40px 32px;
          transition: transform 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .pricing-card:hover { transform: translateY(-4px); border-color: #333; }
        .pricing-card.highlight {
          background: linear-gradient(180deg, #12101a 0%, #0a0a0a 100%);
          border: 1px solid rgba(139,92,246,0.4);
          box-shadow: 0 20px 40px -10px rgba(139,92,246,0.15);
        }
        .pricing-card.current-plan {
          border-color: #22c55e40;
          background: linear-gradient(180deg, #0a120a 0%, #0a0a0a 100%);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid #333;
          color: #fff;
          padding: 14px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          width: 100%; margin-top: auto;
          font-family: inherit;
        }
        .btn-outline:hover { background: #1a1a1a; border-color: #555; }
        .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary {
          background: linear-gradient(135deg, #4F7EFF, #8B5CF6);
          color: #fff; border: none;
          padding: 14px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s, transform 0.2s;
          width: 100%; margin-top: auto;
          font-family: inherit;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-current {
          background: #22c55e15;
          border: 1px solid #22c55e40;
          color: #22c55e;
          padding: 14px; border-radius: 8px;
          font-size: 14px; font-weight: 700;
          width: 100%; margin-top: auto;
          font-family: inherit;
          cursor: default;
        }
        .btn-downgrade {
          background: transparent;
          border: 1px solid #333;
          color: #666;
          padding: 14px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          width: 100%; margin-top: auto;
          font-family: inherit;
        }
        .btn-downgrade:hover { border-color: #555; color: #888; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 800, color: "#fff"
          }}>PH</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>PrepHire</span>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "transparent", border: "none",
          color: "#888", fontSize: 14, cursor: "pointer", fontWeight: 500
        }}>
          Close ✕
        </button>
      </nav>

      <div style={{ flex: 1, padding: "40px 24px 80px", maxWidth: 1000, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ color: "#4F7EFF", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Pricing
          </div>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
            Upgrade And Grow
          </h1>
          <p style={{ color: "#888", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Invest in your career. Upgrade to unlock unlimited AI feedback and interview prep.
          </p>
          {currentPlan && (
            <div style={{ marginTop: 16, fontSize: 13, color: "#555" }}>
              You are currently on the{" "}
              <span style={{ color: "#4F7EFF", fontWeight: 700, textTransform: "capitalize" }}>
                {currentPlan} plan
              </span>
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.name);
            const isUpgrade = currentPlan && planOrder.indexOf(plan.name.toLowerCase()) > planOrder.indexOf(currentPlan);
            const isDowngrade = currentPlan && planOrder.indexOf(plan.name.toLowerCase()) < planOrder.indexOf(currentPlan);

            return (
              <div key={plan.name} className={`pricing-card ${plan.highlight && !isCurrent ? 'highlight' : ''} ${isCurrent ? 'current-plan' : ''}`}>

                {plan.highlight && !isCurrent && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                    color: "#fff", padding: "4px 12px", borderRadius: 100,
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase"
                  }}>
                    Most Popular
                  </div>
                )}

                {isCurrent && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "#22c55e",
                    color: "#fff", padding: "4px 12px", borderRadius: 100,
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase"
                  }}>
                    ✓ Active Plan
                  </div>
                )}

                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 16 }}>{plan.name}</h3>

                <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-2px" }}>{plan.price}</span>
                  <span style={{ color: "#666", fontSize: 14, fontWeight: 500 }}>{plan.period}</span>
                </div>

                <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5, minHeight: 44, marginBottom: 32 }}>
                  {plan.desc}
                </p>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: isCurrent ? "#aaa" : "#ccc" }}>
                      <span style={{ color: isCurrent ? "#22c55e" : "#4F7EFF", fontSize: 14 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button logic */}
                {isCurrent && (
                  <button className="btn-current">✓ Current Plan</button>
                )}
                {isUpgrade && (
                  <button
                    className={plan.highlight ? "btn-primary" : "btn-outline"}
                    onClick={() => navigate("/dashboard")}
                  >
                    {getButtonText(plan.name)} →
                  </button>
                )}
                {isDowngrade && (
                  <button className="btn-downgrade" onClick={() => navigate("/dashboard")}>
                    {getButtonText(plan.name)}
                  </button>
                )}
                {!currentPlan && (
                  <button
                    className={plan.highlight ? "btn-primary" : "btn-outline"}
                    onClick={() => navigate("/signup")}
                  >
                    {getButtonText(plan.name)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}