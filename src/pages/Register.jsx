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

function InputField({ label, type = "text", value, onChange, placeholder, autoComplete, hint }) {
  const [focused, setFocused] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPw ? "text" : "password") : type

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#4b5563", letterSpacing: "0.03em" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 11, color: "#9ca3af" }}>{hint}</span>}
      </div>
      <div style={{
        position: "relative", borderRadius: 10,
        border: `1.5px solid ${focused ? "#2563eb" : "#e5e9f2"}`,
        background: focused ? "#fafcff" : "white",
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      }}>
        <input
          type={inputType} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: isPassword ? "12px 44px 12px 14px" : "12px 14px",
            fontSize: 14, color: "#111827", background: "transparent",
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

const steps = [
  { label: "Account", icon: "◎" },
  { label: "Profile", icon: "◈" },
  { label: "Done", icon: "✓" },
]

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const pwColors = ["#e5e9f2", "#ef4444", "#f59e0b", "#22c55e"]
  const pwLabels = ["", "Too short", "Fair", "Strong"]

  const register = async () => {
    if (!name || !email || !password) return toast.error("All fields required")
    if (password.length < 6) return toast.error("Password must be at least 6 characters")
    try {
      setLoading(true)
      await axios.post("/auth/register", { name, email, password })
      toast.success("Account created")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8faff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .grid-rule {
          background-image: linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .link-blue { color: #2563eb; font-weight: 500; font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .link-blue:hover { color: #1d4ed8; text-decoration: underline; }
        .btn-primary {
          width: 100%; padding: 13px; background: linear-gradient(135deg, #1d4ed8, #1e40af);
          color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: -0.01em; font-family: inherit;
          box-shadow: 0 2px 8px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(29,78,216,0.4); transform: translateY(-1px); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* LEFT — form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 32px", position: "relative",
      }}>
        <div className="grid-rule" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)",
          opacity: 0.4, pointerEvents: "none", filter: "blur(40px)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ width: "100%", maxWidth: 400, position: "relative" }}
        >
          {/* back */}
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

          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg,#2563eb,#0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="1" width="6" height="9" rx="3" stroke="white" strokeWidth="1.4"/>
                <path d="M2.5 7.5A5.5 5.5 0 0 0 13.5 7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8" y1="13" x2="8" y2="15" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>MediVoice</span>
          </div>

          <h1 className="serif" style={{
            fontSize: 34, fontWeight: 400, color: "#0f1629",
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8,
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28, fontWeight: 300 }}>
            Free forever. No credit card required.
          </p>

          {/* step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "#1d4ed8" : "#f3f4f6",
                  color: i === 0 ? "white" : "#9ca3af",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600,
                }}>
                  {i === 0 ? "1" : i === 1 ? "2" : "3"}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: "#e5e9f2", margin: "0 6px" }} />
                )}
              </div>
            ))}
          </div>

          <InputField label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Sharma" autoComplete="name" />
          <InputField label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <InputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" hint="Min. 6 characters" />

          {/* password strength */}
          {password.length > 0 && (
            <div style={{ marginTop: -8, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{
                    flex: 1, height: 3, borderRadius: 100,
                    background: pwStrength >= n ? pwColors[pwStrength] : "#e5e9f2",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: pwColors[pwStrength], marginTop: 5 }}>{pwLabels[pwStrength]}</p>
            </div>
          )}

          {/* terms */}
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, lineHeight: 1.6 }}>
            By creating an account you agree to our{" "}
            <span style={{ color: "#2563eb", cursor: "pointer" }}>Terms of Service</span>{" "}
            and{" "}
            <span style={{ color: "#2563eb", cursor: "pointer" }}>Privacy Policy</span>.
          </p>

          <motion.button className="btn-primary" onClick={register} disabled={loading} whileTap={{ scale: 0.98 }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Creating account…
                </motion.span>
              ) : (
                <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Create account →
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
            Already have an account?{" "}
            <Link to="/login" className="link-blue">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT — brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          width: 420, flexShrink: 0,
          background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #0c4a6e 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "56px 44px", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: -60, right: -60, width: 320, height: 320,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60, width: 280, height: 280,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
          }}>
            WHY MEDIVOICE
          </span>

          <h2 className="serif" style={{
            fontSize: 30, color: "white", letterSpacing: "-0.02em",
            lineHeight: 1.2, marginTop: 16, marginBottom: 32,
          }}>
            Healthcare scheduling
            <span style={{ fontStyle: "italic", color: "#7dd3fc" }}> that gets out of your way.</span>
          </h2>

          {[
            { icon: "◎", text: "No forms — just speak naturally" },
            { icon: "⬡", text: "AI matches you to the right specialist" },
            { icon: "◈", text: "Confirmed in under 30 seconds" },
            { icon: "○", text: "HIPAA-compliant and encrypted" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, ease }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                marginBottom: 18,
              }}
            >
              <span style={{
                fontSize: 16, color: "#7dd3fc", flexShrink: 0,
                marginTop: 1, lineHeight: 1.4,
              }}>
                {item.icon}
              </span>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontWeight: 300 }}>
                {item.text}
              </p>
            </motion.div>
          ))}

          <div style={{
            marginTop: 36, padding: "20px 24px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {["R","K","M"].map((l, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `hsl(${200 + i * 25}, 80%, ${55 + i * 6}%)`,
                  border: "2px solid rgba(255,255,255,0.2)",
                  marginLeft: i > 0 ? -8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "white", fontWeight: 700,
                }}>
                  {l}
                </div>
              ))}
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>
                +9,997 patients joined
              </span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, fontWeight: 300 }}>
              Trusted by patients across India for fast, reliable appointment booking.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}