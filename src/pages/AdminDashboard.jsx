import { useState, useEffect } from "react"
import axios from "../api/axios"
import toast from "react-hot-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1]

/**
 * FIX: returns "YYYY-MM-DD" using LOCAL calendar date, not UTC.
 * toISOString() returns UTC — for India (UTC+5:30), picking a slot
 * at e.g. 2:00 AM IST would save the previous day's date in the DB.
 * The voice controller queries using local date, so they never matched.
 */
function localDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

function StatCard({ label, value, trend, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      style={{
        background: accent
          ? "linear-gradient(135deg, #1d4ed8, #1e40af)"
          : "white",
        border: accent ? "none" : "1px solid #eef0f6",
        borderRadius: 14, padding: "22px 24px",
        boxShadow: accent
          ? "0 4px 20px rgba(29,78,216,0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <p style={{
        fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
        fontWeight: 500,
        color: accent ? "rgba(255,255,255,0.55)" : "#9ca3af",
        marginBottom: 10,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em",
        color: accent ? "white" : "#0f1629", lineHeight: 1,
      }}>
        {value}
      </p>
      {trend !== undefined && (
        <p style={{ fontSize: 12, marginTop: 6, color: accent ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
          {trend}
        </p>
      )}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "white", border: "1px solid #eef0f6", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      fontSize: 13, color: "#374151",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p>{payload[0].value} slot{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [slotRes, apptRes] = await Promise.all([
        axios.get("/appointments/slots"),
        axios.get("/admin/appointments"),
      ])
      setSlots(slotRes.data)
      setAppointments(apptRes.data.data)
    } catch { toast.error("Failed to load data") }
  }

  useEffect(() => {
    load()
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate("/admin-login")
  }

  const create = async () => {
    if (!selectedDate) return toast.error("Select a date and time first")

    // FIX: use localDateStr() instead of toISOString().split("T")[0]
    // toISOString() is UTC — it would save the wrong date for IST users,
    // causing voice booking to never find the slot (it queries local date).
    const date = localDateStr(selectedDate)
    const t = selectedDate.toTimeString().slice(0, 5)

    try {
      setLoading(true)
      await axios.post("/admin/slots", { date, time: t })
      toast.success("Slot created")
      setSelectedDate(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot")
    } finally { setLoading(false) }
  }

  const deleteSlot = async (id) => {
    try {
      await axios.delete(`/admin/slots/${id}`)
      toast.success("Slot removed")
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed")
    }
  }

  // FIX: also use localDateStr() here for consistent chart labels
  const chartData = slots.reduce((acc, slot) => {
    const dateKey = String(slot.date).slice(0, 10)
    const ex = acc.find(d => d.date === dateKey)
    if (ex) ex.count += 1
    else acc.push({ date: dateKey, count: 1 })
    return acc
  }, []).map(d => ({
    ...d,
    date: new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }))

  const bookedCount = appointments.filter(a => a.status === "booked").length

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8faff",
      padding: "36px 40px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e9f2; border-radius: 100px; }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input {
          width: 100% !important;
          padding: 11px 14px !important;
          border: 1.5px solid #e5e9f2 !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          font-family: inherit !important;
          color: #111827 !important;
          outline: none !important;
          transition: border-color 0.2s !important;
        }
        .react-datepicker__input-container input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08) !important;
        }
        .react-datepicker { border: 1px solid #eef0f6 !important; border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; font-family: inherit !important; }
        .react-datepicker__header { background: white !important; border-bottom: 1px solid #eef0f6 !important; border-radius: 12px 12px 0 0 !important; }
        .react-datepicker__day--selected { background: #1d4ed8 !important; border-radius: 6px !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L8.8 5.3H13.3L9.8 7.9L11 12.3L7 9.7L3 12.3L4.2 7.9L0.7 5.3H5.2L7 1Z" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, letterSpacing: "0.04em" }}>
                ADMIN PORTAL
              </span>
            </div>
            <h1 className="serif" style={{
              fontSize: 30, fontWeight: 400, color: "#0f1629",
              letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              Dashboard
              <span style={{ fontStyle: "italic", color: "#6b7280", fontSize: 22 }}>
                {" "}— {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{
              padding: "8px 14px", borderRadius: 8,
              border: "1px solid #eef0f6", background: "white",
              fontSize: 14, color: "#374151", fontWeight: 500,
            }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <button
              onClick={logout}
              style={{
                padding: "10px 18px", borderRadius: 10,
                background: "white", border: "1px solid #fee2e2",
                color: "#ef4444", fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background = "#fef2f2"; e.target.style.boxShadow = "0 2px 8px rgba(239,68,68,0.15)" }}
              onMouseLeave={e => { e.target.style.background = "white"; e.target.style.boxShadow = "none" }}
            >
              Sign out
            </button>
          </motion.div>
        </div>

        {/* ── stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Total slots" value={slots.length} trend="All time" delay={0.05} />
          <StatCard label="Appointments" value={appointments.length} trend="All patients" delay={0.1} />
          <StatCard label="Booked" value={bookedCount} trend={`${slots.length ? Math.round((bookedCount / slots.length) * 100) : 0}% fill rate`} delay={0.15} />
          <StatCard label="System" value="Online" trend="All services running" accent delay={0.2} />
        </div>

        {/* ── chart + appointments ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.25 }}
            style={{
              background: "white", border: "1px solid #eef0f6",
              borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em" }}>
                Slot activity
              </h2>
              <span style={{
                fontSize: 11, color: "#9ca3af", background: "#f3f4f6",
                padding: "3px 10px", borderRadius: 100,
              }}>
                By date
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="count"
                  stroke="#1d4ed8" strokeWidth={2}
                  dot={{ fill: "#1d4ed8", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* appointments list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.3 }}
            style={{
              background: "white", border: "1px solid #eef0f6",
              borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em" }}>
                Appointments
              </h2>
              <span style={{
                fontSize: 12, color: "#2563eb",
                background: "#eff6ff", border: "1px solid #bfdbfe",
                padding: "3px 10px", borderRadius: 100,
              }}>
                {appointments.length} total
              </span>
            </div>
            <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {appointments.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>
                  No appointments yet
                </p>
              ) : appointments.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: 10,
                    background: "#f9fafb", border: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `hsl(${210 + (i * 37) % 90}, 70%, 88%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      color: `hsl(${210 + (i * 37) % 90}, 70%, 35%)`,
                      flexShrink: 0,
                    }}>
                      {a.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af" }}>
                        {new Date(`1970-01-01T${a.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "4px 10px",
                    borderRadius: 100,
                    background: a.status === "booked" ? "#f0fdf4" : "#f9fafb",
                    color: a.status === "booked" ? "#16a34a" : "#6b7280",
                    border: `1px solid ${a.status === "booked" ? "#bbf7d0" : "#e5e9f2"}`,
                  }}>
                    {a.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── create slot + slot list ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* create */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.35 }}
            style={{
              background: "white", border: "1px solid #eef0f6",
              borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em", marginBottom: 6 }}>
              Create slot
            </h2>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18, fontWeight: 300 }}>
              Add a new appointment slot to the schedule
            </p>

            <DatePicker
              selected={selectedDate}
              onChange={d => setSelectedDate(d)}
              showTimeSelect
              timeIntervals={30}
              dateFormat="eee, MMM d · h:mm aa"
              placeholderText="Pick a date and time"
              minDate={new Date()}
            />

            <button
              onClick={create}
              disabled={loading || !selectedDate}
              style={{
                marginTop: 12, width: "100%", padding: 13,
                background: loading || !selectedDate
                  ? "#f3f4f6"
                  : "linear-gradient(135deg, #1d4ed8, #1e40af)",
                color: loading || !selectedDate ? "#9ca3af" : "white",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: loading || !selectedDate ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading || !selectedDate ? "none" : "0 2px 8px rgba(29,78,216,0.25)",
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
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v11M2 7.5h11" stroke={!selectedDate ? "#9ca3af" : "white"} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Create slot
                </>
              )}
            </button>
          </motion.div>

          {/* slot list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.4 }}
            style={{
              background: "white", border: "1px solid #eef0f6",
              borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f1629", letterSpacing: "-0.02em" }}>
                All slots
              </h2>
              <span style={{
                fontSize: 12, color: "#9ca3af", background: "#f3f4f6",
                padding: "3px 10px", borderRadius: 100,
              }}>
                {slots.length} total
              </span>
            </div>
            <div style={{
              maxHeight: 280, overflowY: "auto",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            }}>
              {slots.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af", gridColumn: "1/-1", textAlign: "center", padding: "24px 0" }}>
                  No slots yet
                </p>
              ) : slots.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: s.is_booked ? "#fafafa" : "#f8faff",
                    border: `1px solid ${s.is_booked ? "#f3f4f6" : "#eef3ff"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: s.is_booked ? "#9ca3af" : "#0f1629" }}>
                        {new Date(`1970-01-01T${s.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </p>
                      {/* FIX: use local date parsing here too */}
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        {new Date(`${String(s.date).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    {s.is_booked ? (
                      <span style={{ fontSize: 10, color: "#9ca3af", background: "#f3f4f6", padding: "2px 6px", borderRadius: 100 }}>
                        Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => deleteSlot(s.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#f87171", fontSize: 11, padding: "2px 0",
                          fontFamily: "inherit",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={e => e.target.style.color = "#ef4444"}
                        onMouseLeave={e => e.target.style.color = "#f87171"}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}