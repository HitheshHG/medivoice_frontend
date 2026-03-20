import { useEffect, useState } from "react"
import axios from "../api/axios"
import Sidebar from "../components/Sidebar"
import VoiceButton from "../components/VoiceButton"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

/**
 * FIX: Postgres sometimes returns a date column as a full ISO timestamp
 * ("2026-03-21T00:00:00.000Z") instead of a plain "YYYY-MM-DD" string.
 * Passing that directly into new Date() gives UTC midnight, which in India
 * (UTC+5:30) renders as the previous calendar day.
 *
 * Solution: always slice the first 10 chars to get "YYYY-MM-DD", then
 * append T00:00:00 (no Z) so the browser treats it as LOCAL midnight.
 */
function parseLocalDate(dateStr) {
  const datePart = String(dateStr).slice(0, 10) // "YYYY-MM-DD"
  return new Date(`${datePart}T00:00:00`)
}

function StatCard({ label, value, sub, accent = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      style={{
        background: accent
          ? "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)"
          : "white",
        border: accent ? "none" : "1px solid #eef0f6",
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: accent
          ? "0 4px 20px rgba(29,78,216,0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <p style={{
        fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.6)" : "#9ca3af",
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em",
        color: accent ? "white" : "#0f1629",
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.5)" : "#9ca3af", marginTop: 4 }}>
          {sub}
        </p>
      )}
    </motion.div>
  )
}

function SlotCard({ slot, onBook, index }) {
  const [hover, setHover] = useState(false)

  const dateObj = parseLocalDate(slot.date)
  const dateLabel = dateObj.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease, delay: index * 0.05 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        border: `1px solid ${hover && !slot.is_booked ? "#bfdbfe" : "#eef0f6"}`,
        borderRadius: 14,
        padding: "20px",
        boxShadow: hover && !slot.is_booked
          ? "0 4px 20px rgba(37,99,235,0.1)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f1629", letterSpacing: "-0.02em" }}>
          {new Date(`1970-01-01T${slot.time}`).toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit", hour12: true,
          })}
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {dateLabel}
        </p>
      </div>

      <button
        disabled={slot.is_booked}
        onClick={() => onBook(slot.id)}
        style={{
          width: "100%", padding: "9px 0", borderRadius: 8,
          fontSize: 13, fontWeight: 500, cursor: slot.is_booked ? "not-allowed" : "pointer",
          border: slot.is_booked ? "1px solid #e5e9f2" : "1px solid #1d4ed8",
          background: slot.is_booked ? "#f9fafb" : hover ? "#1d4ed8" : "transparent",
          color: slot.is_booked ? "#9ca3af" : hover ? "white" : "#1d4ed8",
          transition: "background 0.2s, color 0.2s",
          fontFamily: "inherit",
        }}
      >
        {slot.is_booked ? "Unavailable" : "Book slot"}
      </button>
    </motion.div>
  )
}

export default function Dashboard() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(new Date())

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {} }
    catch { return {} }
  })()

  const load = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/appointments/slots")
      setSlots(res.data)
    } catch { toast.error("Failed to load slots") }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const book = async (id) => {
    try {
      await axios.post("/appointments/book", { slot_id: id })
      toast.success("Appointment booked")
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed")
    }
  }

  const available = slots.filter(s => !s.is_booked).length
  const booked    = slots.filter(s => s.is_booked).length

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
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e9f2; border-radius: 100px; }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* ── header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: 36,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p style={{
              fontSize: 11, fontWeight: 500, color: "#9ca3af",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4,
            }}>
              {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="serif" style={{
              fontSize: 32, color: "#0f1629", letterSpacing: "-0.02em",
              lineHeight: 1.1, fontWeight: 400,
            }}>
              Good {time.getHours() < 12 ? "morning" : time.getHours() < 18 ? "afternoon" : "evening"},{" "}
              <span style={{ fontStyle: "italic" }}>{user.name?.split(" ")[0] || "there"}</span>
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, fontWeight: 300 }}>
              Here's your health overview for today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <VoiceButton reload={load} />
          </motion.div>
        </div>

        {/* ── stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard
            label="Live clock"
            value={time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            sub={time.toLocaleTimeString([], { second: "2-digit" }) + "s"}
            delay={0.05}
          />
          <StatCard label="Available slots" value={available} sub="Ready to book" delay={0.1} />
          <StatCard label="Booked slots" value={booked} sub="Across all dates" delay={0.15} />
          <StatCard label="Your doctor" value="Dr. Sharma" sub="General Physician" accent delay={0.2} />
        </div>

        {/* ── doctor card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.25 }}
          style={{
            background: "white", border: "1px solid #eef0f6", borderRadius: 16,
            padding: "24px 28px", marginBottom: 28,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
              border: "1px solid #bfdbfe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>
              👨‍⚕️
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em" }}>
                Dr. Anil Sharma
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>General Physician · MBBS, MD</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <span className="pulse-dot" style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                }} />
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 500 }}>Available today</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8,
              border: "1px solid #eef0f6", background: "#f8faff",
              fontSize: 12, color: "#6b7280",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.3"/>
                <path d="M1 6h12" stroke="#9ca3af" strokeWidth="1.3"/>
                <path d="M4 1v2M10 1v2" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Next: Tomorrow
            </div>
            <button
              onClick={() => {
                const first = slots.find(s => !s.is_booked)
                if (first) book(first.id)
                else toast.error("No slots available")
              }}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(29,78,216,0.25)",
                transition: "box-shadow 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 4px 16px rgba(29,78,216,0.35)"; e.target.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.target.style.boxShadow = "0 2px 8px rgba(29,78,216,0.25)"; e.target.style.transform = "translateY(0)" }}
            >
              Book appointment
            </button>
          </div>
        </motion.div>

        {/* ── upcoming ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 14, padding: "18px 22px",
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 32,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#dcfce7", border: "1px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="11" rx="2" stroke="#22c55e" strokeWidth="1.3"/>
              <path d="M1 6h14" stroke="#22c55e" strokeWidth="1.3"/>
              <path d="M4.5 1v2M11.5 1v2" stroke="#22c55e" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>Upcoming appointments</p>
            <p style={{ fontSize: 12, color: "#4ade80", marginTop: 2 }}>
              No upcoming appointments — use the voice button or book a slot below
            </p>
          </div>
        </motion.div>

        {/* ── slots ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em" }}>
              Available slots
            </h2>
            <span style={{
              fontSize: 12, color: "#9ca3af",
              background: "#f3f4f6", padding: "4px 10px", borderRadius: 100,
            }}>
              {available} open
            </span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{
                    height: 110, borderRadius: 14, background: "white",
                    border: "1px solid #eef0f6",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }} />
                ))}
              </motion.div>
            ) : slots.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  textAlign: "center", padding: "48px 24px",
                  background: "white", border: "1px solid #eef0f6",
                  borderRadius: 16,
                }}
              >
                <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
                <p style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>No slots available</p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Check back later or use the voice button</p>
              </motion.div>
            ) : (
              <motion.div
                key="slots"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
              >
                {slots.map((s, i) => (
                  <SlotCard key={s.id} slot={s} onBook={book} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}