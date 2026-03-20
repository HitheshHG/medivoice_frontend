import { useEffect, useState } from "react"
import axios from "../api/axios"
import Sidebar from "../components/Sidebar"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

function Field({ label, value, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid #f3f4f6",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: "#f8faff", border: "1px solid #eef0f6",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#6b7280",
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
            {label}
          </p>
          <p style={{ fontSize: 15, color: "#111827", fontWeight: 500, letterSpacing: "-0.01em" }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await axios.get("/auth/me")
      setUser(res.data)
    } catch {
      toast.error("Session expired — please sign in again")
      localStorage.clear()
      window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8faff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
        .skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e9ebee 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 12px;
        }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {loading ? (
          <div>
            <div className="skeleton" style={{ height: 32, width: 160, marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 240, maxWidth: 560 }} />
          </div>
        ) : (
          <>
            {/* page header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{ marginBottom: 32 }}
            >
              <h1 className="serif" style={{
                fontSize: 30, fontWeight: 400, color: "#0f1629",
                letterSpacing: "-0.02em", marginBottom: 4,
              }}>
                Profile
              </h1>
              <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 300 }}>
                Your account information
              </p>
            </motion.div>

            <div style={{ maxWidth: 560 }}>

              {/* avatar card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.05 }}
                style={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
                  borderRadius: 20, padding: "28px 28px 24px",
                  marginBottom: 16, position: "relative", overflow: "hidden",
                }}
              >
                {/* bg glare */}
                <div style={{
                  position: "absolute", top: -60, right: -60,
                  width: 200, height: 200, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700, color: "white",
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}>
                      {user?.name}
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
                      {user?.email}
                    </p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 100,
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white", fontWeight: 500, letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      {user?.role || "Patient"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* details card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.12 }}
                style={{
                  background: "white", border: "1px solid #eef0f6",
                  borderRadius: 16, padding: "8px 24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  marginBottom: 16,
                }}
              >
                <Field
                  label="Full name"
                  value={user?.name}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1.5 13c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  }
                />
                <Field
                  label="Email address"
                  value={user?.email}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1 5l6.5 4L14 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                  }
                />
                <Field
                  label="Account role"
                  value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Patient"}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 1L9.2 5.5H14L10.2 8.2 11.5 13 7.5 10.3 3.5 13 4.8 8.2 1 5.5H5.8L7.5 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                  }
                />
                {/* last row - no border */}
                <div style={{ padding: "16px 0 4px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: "#f8faff", border: "1px solid #eef0f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6b7280",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M7.5 5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>Member since</p>
                    <p style={{ fontSize: 15, color: "#111827", fontWeight: 500 }}>
                      {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* sign out */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => { localStorage.clear(); window.location.href = "/login" }}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12,
                    background: "white", border: "1px solid #fee2e2",
                    color: "#ef4444", fontSize: 14, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.background = "#fef2f2"; e.target.style.boxShadow = "0 2px 8px rgba(239,68,68,0.1)" }}
                  onMouseLeave={e => { e.target.style.background = "white"; e.target.style.boxShadow = "none" }}
                >
                  Sign out
                </button>
              </motion.div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}