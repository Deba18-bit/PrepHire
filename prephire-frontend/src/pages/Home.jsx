import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


// ── Scroll animation hook ──────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15, ...options }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);
  return [ref, inView];
}

// ── Animated section wrapper ───────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────
const pillars = [
  {
    icon: "◈",
    title: "Design & ATS Inspector",
    desc: "We scan your resume the way machines do. Font issues, layout problems, ATS traps — caught and fixed before a human ever sees it.",
  },
  {
    icon: "◎",
    title: "Credential Auditor",
    desc: "Not all certifications are equal. We rank yours by live market value and tell you exactly what to pursue next.",
  },
  {
    icon: "◇",
    title: "Experience & Impact Analyzer",
    desc: "Vague bullet points kill applications. We check for STAR method, quantified metrics, and real business impact.",
  },
  {
    icon: "◉",
    title: "Future-Proof Calculator",
    desc: "Powered by live web search. We score your skills against today's job market — not last year's training data.",
  },
  {
    icon: "▣",
    title: "Technical Project Validator",
    desc: "We tier your projects by complexity, verify live links, and check if your stack matches your target role.",
  },
  {
    icon: "◻",
    title: "Cover Letter Analyzer",
    desc: "Generic letters get ignored. We check alignment, tone, and whether you answered 'Why this company.'",
  },
];

const steps = [
  { num: "01", title: "Upload Your Resume", desc: "Drop your PDF. Any field, any experience level, any role." },
  { num: "02", title: "AI Deep Analysis", desc: "Our AI scores across 5 pillars simultaneously. Honest. No sugarcoating." },
  { num: "03", title: "Get Your Score", desc: "Detailed score out of 100 with specific reasons and actionable fixes." },
  { num: "04", title: "Practice Interviews", desc: "Talk to our AI interviewer. Get scored on answers, confidence, communication." },
];

const pricing = [
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
      "Requires account",
    ],
    cta: "Create Free Account",
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
      "Priority support",
    ],
    cta: "Go Pro",
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
      "Dedicated support",
    ],
    cta: "Get Max",
    highlight: false,
  },
];

const testimonials = [
  {
    text: "PrepHire told me my Django project was irrelevant for ML roles. I added a proper NLP project. Got shortlisted in 2 weeks.",
    name: "Ritam D.",
    role: "Data Science Student, Kolkata",
  },
  {
    text: "I had placeholder text in my resume and didn't know. PrepHire caught it immediately. Embarrassing but necessary.",
    name: "Priya S.",
    role: "CS Graduate, Bangalore",
  },
  {
    text: "The ATS score was eye-opening. My resume was being rejected before humans even saw it. Fixed it in one session.",
    name: "Arjun M.",
    role: "BTech Student, Hyderabad",
  },
];

// ── Main Component ─────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  // ── AUTH CHECK: Prevent logged-in users from seeing the landing page ──
  useEffect(() => {
    const token = localStorage.getItem("token"); 
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Splash screen
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 300);
          setTimeout(() => setLoading(false), 900);
          return 100;
        }
        return p + 2;
      });
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Navbar scroll effect
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Splash Screen ────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "#080808",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "32px",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.6s ease",
          zIndex: 9999,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#fff",
          }}>PH</div>
          <span style={{
            fontSize: 28, fontWeight: 700, color: "#fff",
            letterSpacing: "-0.5px",
            fontFamily: "'DM Sans', sans-serif",
          }}>PrepHire</span>
        </div>

        {/* Loading bar */}
        <div style={{ width: 200, height: 2, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: "linear-gradient(90deg, #6b328b, #fafafb)",
            width: `${progress}%`,
            transition: "width 0.05s linear",
          }} />
        </div>

        <span style={{ color: "#444", fontSize: 13, letterSpacing: "0.1em", fontFamily: "monospace" }}>
          {progress < 40 ? "GET..." : progress < 75 ? "SET..." : "GO..."}
        </span>
      </div>
    );
  }

  // ── Main Page ────────────────────────────────────────────────────
  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      {/* Google Font & Uniform Card Layout Fixes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        html { scroll-behavior: smooth; }

        .nav-link {
          color: #888;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link:hover { color: #fff; }

        .btn-primary {
          background: linear-gradient(135deg, #4F7EFF, #8B5CF6);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          font-family: inherit;
        }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: #fff;
          border: 1px solid #333;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .btn-outline:hover { border-color: #555; background: #111; }

        /* Standard flexible grid */
        .uniform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        /* Strict 4-column grid for the Process steps */
        .process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .pillar-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 28px;
          transition: border-color 0.3s, transform 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .pillar-card:hover { border-color: #333; transform: translateY(-4px); }

        .step-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          transition: border-color 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .step-card:hover { border-color: #2a2a2a; }

        .pricing-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 32px;
          transition: border-color 0.3s, transform 0.3s;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card.highlighted {
          border-color: #4F7EFF;
          background: linear-gradient(135deg, #0a0f1e, #0f0f0f);
        }

        .testimonial-card {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 28px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(8,8,8,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "#fff",
          }}>PH</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>PrepHire</span>
        </div>

        {/* Links & Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
          <button className="nav-link" onClick={() => scrollTo("features")}>Features</button>
          <button className="nav-link" onClick={() => scrollTo("interview")}>Interview</button>
          <button className="nav-link" onClick={() => scrollTo("how-it-works")}>How it Works</button>
          <button className="nav-link" onClick={() => scrollTo("pricing")}>Pricing</button>
          <button className="btn-outline" onClick={() => navigate("/login")}>Sign in</button>
          <button className="btn-primary" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(79,126,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#0f0f0f", border: "1px solid #1a1a1a",
          borderRadius: 100, padding: "6px 14px", marginBottom: 32,
          fontSize: 13, color: "#888",
          animation: "fadeInDown 0.6s ease forwards",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4F7EFF", display: "inline-block" }} />
          AI-Powered Resume Analysis — Free to Start
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 80px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-2px",
          maxWidth: 800,
          marginBottom: 24,
          animation: "fadeInUp 0.7s ease 0.1s both",
        }}>
          Your Resume is
          <br />
          <span style={{ background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Costing You Interviews.
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: "#666", maxWidth: 520,
          lineHeight: 1.7, marginBottom: 40,
          animation: "fadeInUp 0.7s ease 0.2s both",
        }}>
          PrepHire gives you an honest AI-powered score, identifies exactly what's holding you back, and prepares you for interviews — all in one place.
        </p>

        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          animation: "fadeInUp 0.7s ease 0.3s both",
        }}>
          <button
            className="btn-primary"
            style={{ padding: "14px 28px", fontSize: 15 }}
            onClick={() => navigate("/signup")}
          >
            Analyze My Resume Free →
          </button>
          <button
            className="btn-outline"
            style={{ padding: "14px 28px", fontSize: 15 }}
            onClick={() => scrollTo("how-it-works")}
          >
            See How it Works
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: "#444", animation: "fadeInUp 0.7s ease 0.4s both" }}>
          No credit card required · 3 free scans · Signup required
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 48, marginTop: 80, flexWrap: "wrap", justifyContent: "center",
          animation: "fadeInUp 0.7s ease 0.5s both",
        }}>
          {[
            ["10,000+", "Resumes Analyzed"],
            ["92%", "Interview Rate Improvement"],
            ["5", "Deep Evaluation Pillars"],
            ["Free", "To Start"],
          ].map(([stat, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* ── Problem Section ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>The Problem</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
              Why Good Candidates Get Rejected
            </h2>
          </div>
        </Reveal>

        <div className="uniform-grid">
          {[
            { icon: "⊗", title: "ATS Rejection", stat: "76%", desc: "of resumes never reach a human. Automated systems reject them before anyone reads a word." },
            { icon: "⊘", title: "Outdated Skills", stat: "2 yrs", desc: "Your skills may have been relevant 2 years ago. The market moves fast. PrepHire checks against live data." },
            { icon: "⊙", title: "Weak Projects", stat: "Everyone", desc: "has a todo app. PrepHire tells you exactly which projects impress recruiters in 2026." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="pillar-card">
                <div style={{ fontSize: 24, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#4F7EFF", marginBottom: 4 }}>{item.stat}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: 17 }}>{item.title}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>Features</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
              6 Pillars of Deep Resume Analysis
            </h2>
            <p style={{ color: "#555", marginTop: 16, maxWidth: 480, margin: "16px auto 0", fontSize: 16, lineHeight: 1.7 }}>
              Every dimension of your resume analyzed, scored, and explained.
            </p>
          </div>
        </Reveal>

        <div className="uniform-grid">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="pillar-card">
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(79,126,255,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(79,126,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, marginBottom: 16, color: "#4F7EFF",
                }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: 16 }}>{pillar.title}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{pillar.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Interview Practice Section ── */}
      <section id="interview" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: "#0f0f0f",
          border: "1px solid #1a1a1a",
          borderRadius: 20,
          padding: "60px 48px",
          display: "flex",
          gap: 60,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Reveal>
              <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>
                Bonus Feature
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
                AI Interview Coach.
                <br />
                <span style={{ background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  No Resume Needed.
                </span>
              </h2>
              <p style={{ color: "#555", fontSize: 15, marginTop: 16, lineHeight: 1.7, maxWidth: 420 }}>
                Just tell us your target role and experience level. Our AI interviewer asks real industry questions, scores your answers, and gives you specific feedback — exactly like a real interview.
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: 28, padding: "13px 28px", fontSize: 15 }}
                onClick={() => navigate("/signup")}
              >
                Start Practice Interview →
              </button>
            </Reveal>
          </div>

          {/* Right — Feature list */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "◈", title: "No Resume Required", desc: "Just enter your role, field, and experience level. Start instantly." },
              { icon: "◎", title: "Real Industry Questions", desc: "AI asks field-specific questions tailored to your target role and seniority." },
              { icon: "◇", title: "Live Answer Scoring", desc: "Every answer scored on content, clarity, confidence, and structure." },
              { icon: "◉", title: "Selection Probability", desc: "Final score with interview readiness percentage and improvement areas." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(79,126,255,0.15), rgba(139,92,246,0.15))",
                    border: "1px solid rgba(79,126,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: "#4F7EFF",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: "#555", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>Process</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
              From Upload to Interview-Ready in Minutes
            </h2>
          </div>
        </Reveal>

        <div className="process-grid">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="step-card">
                <div style={{ fontSize: 13, color: "#4F7EFF", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "monospace" }}>
                  {step.num}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 17 }}>{step.title}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>Pricing</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
              Start Free. Upgrade When Ready.
            </h2>
            <p style={{ color: "#555", marginTop: 16, fontSize: 16 }}>All plans require a free account. No credit card needed for Free plan.</p>
          </div>
        </Reveal>

        <div className="uniform-grid">
          {pricing.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <div className={`pricing-card ${plan.highlight ? "highlighted" : ""}`}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 100, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>Most Popular</div>
                )}

                <div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: "#666", fontWeight: 600 }}>{plan.name}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                    <span style={{ color: "#555", fontSize: 14 }}>{plan.period}</span>
                  </div>

                  <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>{plan.desc}</p>

                  <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#aaa" }}>
                        <span style={{ color: "#4F7EFF", fontSize: 16 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={plan.highlight ? "btn-primary" : "btn-outline"}
                  style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 600 }}
                  onClick={() => navigate("/signup")}
                >
                  {plan.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#4F7EFF", textTransform: "uppercase", fontWeight: 600 }}>Stories</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
              Real Results. No Fluff.
            </h2>
          </div>
        </Reveal>

        <div className="uniform-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="testimonial-card">
                <div>
                  <div style={{ fontSize: 28, color: "#4F7EFF", marginBottom: 16, lineHeight: 1 }}>"</div>
                  <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{t.text}</p>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: "#555", fontSize: 13, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <Reveal>
          <div style={{
            maxWidth: 600, margin: "0 auto",
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            borderRadius: 20,
            padding: "60px 40px",
          }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16 }}>
              Stop Guessing.
              <br />
              <span style={{ background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Start Improving.
              </span>
            </h2>
            <p style={{ color: "#555", fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
              Join thousands of students and job seekers who used PrepHire to land their first interview.
            </p>
            <button
              className="btn-primary"
              style={{ padding: "14px 32px", fontSize: 16 }}
              onClick={() => navigate("/signup")}
            >
              Analyze My Resume Now — It's Free
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid #111",
        padding: "40px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: "linear-gradient(135deg, #4F7EFF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
          }}>PH</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>PrepHire</span>
          <span style={{ color: "#333", fontSize: 13 }}>· Built for all. Honest by design.</span>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy Policy", "Terms And Conditions"].map((link) => (
            <span key={link} style={{ color: "#444", fontSize: 13, cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#888"}
              onMouseLeave={e => e.target.style.color = "#444"}
            >{link}</span>
          ))}
        </div>

        <div style={{ color: "#333", fontSize: 13 }}>
          © 2026 PrepHire · Built by Debarghya Samadder
        </div>
      </footer>

    </div>
  );
}