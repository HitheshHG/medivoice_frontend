import { useState } from "react"
import axios from "../api/axios"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

export default function Admin() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState([])

  const createSlot = async () => {
    if (!date || !time) return toast.error("Select both a date and time")
    try {
      setLoading(true)
      await axios.post("/admin/slots", { time, date })
      toast.success("Slot created")
      setCreated(prev => [{ date, time, id: Date.now() }, ...prev])
      setTime("")
      setDate("")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot")
    } finally {
      setLoading(false)
    }
  }

  const isValid = date && time

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8faff", padding: "40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        input[type="date"], input[type="time"] {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e5e9f2; border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #111827;
          outline: none; background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        input[type="date"]:focus, input[type="time"]:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        {/* back link */}
        <Link to="/admin-dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6b7280", textDecoration: "none",
          marginBottom: 28, transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#111827"}
          onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Admin dashboard
        </Link>

        {/* header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="11" rx="2" stroke="white" strokeWidth="1.3" />
                <path d="M1 7h14" stroke="white" strokeWidth="1.3" />
                <path d="M4.5 1v2M11.5 1v2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M8 9.5v2M7 10.5h2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="serif" style={{
              fontSize: 26, fontWeight: 400, color: "#0f1629", letterSpacing: "-0.02em",
            }}>
              Add slot
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 300 }}>
            Create a new appointment slot for patients to book
          </p>
        </div>

        {/* form card */}
        <div style={{
          background: "white", border: "1px solid #eef0f6",
          borderRadius: 16, padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          marginBottom: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#4b5563", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#4b5563", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* preview */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: "#f0f7ff", border: "1px solid #dbeafe",
                  borderRadius: 10, padding: "11px 14px",
                  fontSize: 13, color: "#1e40af",
                  display: "flex", alignItems: "center", gap: 8, overflow: "hidden",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.2" />
                  <path d="M7 4v3.5l2 1" stroke="#1e40af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Creating slot for{" "}
                <strong>
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </strong>
                {" at "}
                <strong>
                  {new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                </strong>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={createSlot}
            disabled={loading || !isValid}
            style={{
              width: "100%", padding: 13,
              background: loading || !isValid
                ? "#f3f4f6"
                : "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: loading || !isValid ? "#9ca3af" : "white",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: loading || !isValid ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading || !isValid ? "none" : "0 2px 8px rgba(79,70,229,0.3)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke={!isValid ? "#9ca3af" : "white"} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Create slot
              </>
            )}
          </button>
        </div>

        {/* recently created */}
        <AnimatePresence>
          {created.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "white", border: "1px solid #eef0f6",
                borderRadius: 16, padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                Created this session
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {created.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i === 0 ? 0 : 0 }}
                    style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8faff", border: "1px solid #eef3ff",
                      borderRadius: 10,
                    }}
                  >
                    <p style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                      {new Date(s.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}
                      {new Date(`1970-01-01T${s.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                    <span style={{
                      fontSize: 11, color: "#16a34a",
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      padding: "2px 8px", borderRadius: 100,
                    }}>
                      ✓ Added
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}