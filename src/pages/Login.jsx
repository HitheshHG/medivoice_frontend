import { useState } from "react"
import axios from "../api/axios"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="#9ca3af" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2" stroke="#9ca3af" strokeWidth="1.4"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.7 5.3 1.5 7 1.5 8s2.2 4.5 6.5 4.5c1.3 0 2.5-.3 3.5-.8M7 3.6C7.3 3.5 7.7 3.5 8 3.5c4.3 0 6.5 3.5 6.5 4.5 0 .6-.5 1.5-1.4 2.4" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function InputField({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPw ? "text" : "password") : type

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 12,
        fontWeight: 500,
        color: "#4b5563",
        letterSpacing: "0.03em",
        marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{
        position: "relative",
        borderRadius: 10,
        border: `1.5px solid ${focused ? "#2563eb" : "#e5e9f2"}`,
        background: focused ? "#fafcff" : "white",
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      }}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: isPassword ? "12px 44px 12px 14px" : "12px 14px",
            fontSize: 14,
            color: "#111827",
            background: "transparent",
            border: "none",
            outline: "none",
            borderRadius: 10,
            fontFamily: "inherit",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              padding: 4, borderRadius: 4,
              display: "flex", alignItems: "center",
            }}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async () => {
    if (!email || !password) return toast.error("Please fill in all fields")
    try {
      setLoading(true)
      const res = await axios.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      toast.success("Welcome back")
      navigate("/dashboard")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === "Enter") login() }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        background: "#f8faff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .grid-rule {
          background-image:
            linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .link-blue {
          color: #2563eb;
          font-weight: 500;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .link-blue:hover { color: #1d4ed8; text-decoration: underline; }
        .link-muted {
          color: #9ca3af;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .link-muted:hover { color: #4b5563; }
        .btn-primary {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 8px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.2s;
          font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(29,78,216,0.4);
          transform: translateY(-1px);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── left panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          position: "relative",
        }}
      >
        {/* grid */}
        <div className="grid-rule" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        {/* orb */}
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)",
          opacity: 0.4, pointerEvents: "none", filter: "blur(40px)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{
            width: "100%",
            maxWidth: 400,
            position: "relative",
          }}
        >
          {/* back link */}
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#6b7280", textDecoration: "none",
            marginBottom: 32, transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#111827"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </Link>

          {/* logo mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#2563eb,#0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="1" width="6" height="9" rx="3" stroke="white" strokeWidth="1.4"/>
                <path d="M2.5 7.5A5.5 5.5 0 0 0 13.5 7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8" y1="13" x2="8" y2="15" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>
              MediVoice
            </span>
          </div>

          {/* heading */}
          <h1 className="serif" style={{
            fontSize: 34, fontWeight: 400, color: "#0f1629",
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, fontWeight: 300 }}>
            Sign in to manage your appointments
          </p>

          {/* form */}
          <InputField
            label="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {/* forgot */}
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#2563eb"}
              onMouseLeave={e => e.target.style.color = "#9ca3af"}
            >
              Forgot password?
            </span>
          </div>

          {/* submit */}
          <motion.button
            className="btn-primary"
            onClick={login}
            disabled={loading}
            onKeyDown={handleKey}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign in →
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "24px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "#eef0f6" }} />
            <span style={{ fontSize: 11, color: "#d1d5db", letterSpacing: "0.06em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#eef0f6" }} />
          </div>

          {/* links */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 10,
            alignItems: "center",
          }}>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              No account?{" "}
              <Link to="/register" className="link-blue">Create one free</Link>
            </p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Admin access?{" "}
              <Link to="/admin-login" className="link-blue">Sign in as admin</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── right panel (decorative) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          width: 420,
          background: "linear-gradient(160deg, #1e3a8a 0%, #0c4a6e 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 40px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* ambient glow */}
        <div style={{
          position: "absolute", bottom: -100, right: -100,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 40, left: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* top content */}
        <div style={{ position: "relative" }}>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            fontWeight: 500,
          }}>
            TRUSTED BY 10,000+ PATIENTS
          </span>

          <h2 className="serif" style={{
            fontSize: 32, color: "white",
            letterSpacing: "-0.02em", lineHeight: 1.15,
            marginTop: 20, fontStyle: "italic",
          }}>
            "Booked in under<br/>30 seconds — no hold music."
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.5)",
            marginTop: 16, fontWeight: 300,
          }}>
            — Priya R., patient since 2025
          </p>
        </div>

        {/* stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, position: "relative",
        }}>
          {[
            { n: "10K+", l: "Appointments booked" },
            { n: "500+", l: "Verified doctors" },
            { n: "< 30s", l: "Average booking time" },
            { n: "24 / 7", l: "Always available" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, ease }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <p style={{
                fontSize: 22, fontWeight: 700, color: "white",
                letterSpacing: "-0.04em", lineHeight: 1,
              }}>
                {s.n}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                {s.l}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}