import { useState } from "react"
import axios from "../api/axios"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="#6b7280" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="#6b7280" strokeWidth="1.4" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.7 5.3 1.5 7 1.5 8s2.2 4.5 6.5 4.5c1.3 0 2.5-.3 3.5-.8M7 3.6C7.3 3.5 7.7 3.5 8 3.5c4.3 0 6.5 3.5 6.5 4.5 0 .6-.5 1.5-1.4 2.4" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function DarkInputField({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPw ? "text" : "password") : type

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 500,
        color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em",
        marginBottom: 6, textTransform: "uppercase",
      }}>
        {label}
      </label>
      <div style={{
        position: "relative", borderRadius: 10,
        border: `1.5px solid ${focused ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)"}`,
        background: focused ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.05)",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      }}>
        <input
          type={inputType} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: isPassword ? "12px 44px 12px 14px" : "12px 14px",
            fontSize: 14, color: "rgba(255,255,255,0.9)", background: "transparent",
            border: "none", outline: "none", borderRadius: 10, fontFamily: "inherit",
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(v => !v)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 4,
            borderRadius: 4, display: "flex", alignItems: "center",
          }}>
            <EyeIcon open={showPw} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async () => {
    if (!email || !password) return toast.error("Please fill in all fields")
    try {
      setLoading(true)
      const res = await axios.post("/auth/login", { email, password })
      if (res.data.user.role !== "admin") return toast.error("Unauthorized — admin access only")
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      toast.success("Welcome back, admin")
      navigate("/admin-dashboard")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#0a0f1e", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .link-dim { color: rgba(255,255,255,0.4); font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .link-dim:hover { color: rgba(255,255,255,0.8); }
        .link-accent { color: #818cf8; font-weight: 500; font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .link-accent:hover { color: #a5b4fc; text-decoration: underline; }
        .btn-admin {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: inherit; letter-spacing: -0.01em;
          box-shadow: 0 2px 12px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.2s;
        }
        .btn-admin:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(79,70,229,0.55); transform: translateY(-1px); }
        .btn-admin:active:not(:disabled) { transform: translateY(0); }
        .btn-admin:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>

      {/* background radials */}
      <div style={{ position: "absolute", top: -120, left: "30%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, right: "10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ width: "100%", maxWidth: 420, padding: "0 24px", position: "relative" }}
      >
        {/* back */}
        <Link to="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none",
          marginBottom: 36, transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to user login
        </Link>

        {/* badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, ease }}
          style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(79,70,229,0.4)",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>MediVoice</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>Admin Portal</p>
          </div>
        </motion.div>

        <h1 className="serif" style={{
          fontSize: 34, fontWeight: 400, color: "white",
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8,
        }}>
          Admin access
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, fontWeight: 300 }}>
          Restricted to authorized personnel only
        </p>

        {/* security notice */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.25)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M8 1L2 4v4c0 3.5 2.5 6.3 6 7 3.5-.7 6-3.5 6-7V4L8 1Z" stroke="#818cf8" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5.5 8l2 2 3-3" stroke="#818cf8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>
            This session is monitored. Unauthorized access attempts are logged and reported.
          </p>
        </div>

        <DarkInputField label="Admin email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@medivoice.com" autoComplete="email" />
        <DarkInputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />

        <div style={{ height: 8 }} />

        <motion.button className="btn-admin" onClick={login} disabled={loading} whileTap={{ scale: 0.98 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Verifying credentials…
              </motion.span>
            ) : (
              <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign in as admin →
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div style={{
          display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Patient login?{" "}
            <Link to="/login" className="link-accent">Go to user login</Link>
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            New to MediVoice?{" "}
            <Link to="/register" className="link-accent">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}