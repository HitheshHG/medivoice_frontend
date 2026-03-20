import { useEffect, useState } from "react"
import axios from "../api/axios"
import Sidebar from "../components/Sidebar"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

function CalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 6.5h13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 1v2M10.5 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AppointmentRow({ appt, onCancel, index }) {
  const [confirming, setConfirming] = useState(false)
  const [hover, setHover] = useState(false)

  const timeStr = (() => {
    try {
      return new Date(`1970-01-01T${appt.time}`).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    } catch { return appt.time }
  })()

  const dateStr = (() => {
    try {
      return new Date(appt.date).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    } catch { return appt.date }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease, delay: index * 0.05 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        border: `1px solid ${hover ? "#dbeafe" : "#eef0f6"}`,
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: hover ? "0 4px 16px rgba(37,99,235,0.07)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #bfdbfe",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#2563eb",
      }}>
        <CalIcon />
      </div>

      {/* info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", letterSpacing: "-0.01em" }}>
            Dr. Anil Sharma
          </p>
          <span style={{
            fontSize: 10, fontWeight: 500, padding: "2px 8px",
            borderRadius: 100, letterSpacing: "0.05em",
            background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
          }}>
            BOOKED
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9ca3af" }}>
          <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <CalIcon /> {dateStr}
          </span>
          <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon /> {timeStr}
          </span>
        </div>
      </div>

      {/* cancel */}
      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: "flex", gap: 8 }}
          >
            <button
              onClick={() => { onCancel(appt.id); setConfirming(false) }}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: "#ef4444", color: "white", border: "none",
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                background: "#f3f4f6", color: "#374151", border: "none",
              }}
            >
              Keep
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="cancel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirming(true)}
            style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13,
              fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              background: "white", color: "#ef4444",
              border: "1px solid #fecaca",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.target.style.background = "#fef2f2"; e.target.style.boxShadow = "0 2px 8px rgba(239,68,68,0.1)" }}
            onMouseLeave={e => { e.target.style.background = "white"; e.target.style.boxShadow = "none" }}
          >
            Cancel
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MyAppointments() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("active")   // active | cancelled

  const load = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/appointments/my")
      setData(res.data)
    } catch { toast.error("Failed to load appointments") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    try {
      await axios.delete(`/appointments/${id}`)
      toast.success("Appointment cancelled")
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed")
    }
  }

  const active = data.filter(a => a.status === "booked")
  const cancelled = data.filter(a => a.status === "cancelled")
  const shown = tab === "active" ? active : cancelled

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
          border-radius: 14px;
        }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ marginBottom: 28 }}
        >
          <h1 className="serif" style={{
            fontSize: 30, fontWeight: 400, color: "#0f1629",
            letterSpacing: "-0.02em", marginBottom: 4,
          }}>
            My Appointments
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", fontWeight: 300 }}>
            Manage your upcoming and past bookings
          </p>
        </motion.div>

        {/* summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total", value: data.length },
            { label: "Active", value: active.length, accent: true },
            { label: "Cancelled", value: cancelled.length },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, ease }}
              style={{
                background: s.accent ? "linear-gradient(135deg,#1d4ed8,#1e40af)" : "white",
                border: s.accent ? "none" : "1px solid #eef0f6",
                borderRadius: 14, padding: "18px 20px",
                boxShadow: s.accent ? "0 4px 16px rgba(29,78,216,0.22)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: s.accent ? "rgba(255,255,255,0.6)" : "#9ca3af", marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.accent ? "white" : "#0f1629", letterSpacing: "-0.04em" }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* tabs */}
        <div style={{
          display: "flex", gap: 4,
          background: "#f3f4f6", borderRadius: 10,
          padding: 4, marginBottom: 20, width: "fit-content",
        }}>
          {[["active", "Active", active.length], ["cancelled", "Cancelled", cancelled.length]].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13,
                fontWeight: tab === id ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", border: "none",
                background: tab === id ? "white" : "transparent",
                color: tab === id ? "#111827" : "#6b7280",
                boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {label}
              <span style={{
                fontSize: 11, padding: "1px 7px", borderRadius: 100,
                background: tab === id ? "#f3f4f6" : "transparent",
                color: tab === id ? "#374151" : "#9ca3af",
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* list */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
            </motion.div>
          ) : shown.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                textAlign: "center", padding: "56px 24px",
                background: "white", border: "1px solid #eef0f6",
                borderRadius: 16,
              }}
            >
              <p style={{ fontSize: 36, marginBottom: 12 }}>
                {tab === "active" ? "📅" : "🗂️"}
              </p>
              <p style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>
                {tab === "active" ? "No active appointments" : "No cancelled appointments"}
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                {tab === "active" ? "Head to the dashboard to book a slot" : "All good — nothing cancelled"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {tab === "active"
                ? shown.map((a, i) => (
                  <AppointmentRow key={a.id} appt={a} onCancel={cancel} index={i} />
                ))
                : shown.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, ease }}
                    style={{
                      background: "#fafafa", border: "1px solid #f3f4f6",
                      borderRadius: 14, padding: "16px 20px",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 16,
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#f3f4f6", border: "1px solid #e5e9f2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#9ca3af",
                      }}>
                        <CalIcon />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>Dr. Anil Sharma</p>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                          {(() => { try { return new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) } catch { return a.date } })()} · {a.time}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "3px 10px",
                      borderRadius: 100, background: "#f3f4f6",
                      color: "#9ca3af", border: "1px solid #e5e9f2",
                      letterSpacing: "0.04em",
                    }}>
                      CANCELLED
                    </span>
                  </motion.div>
                ))
              }
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}