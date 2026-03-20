import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

/* ─── tiny helpers ─── */
const ease = [0.16, 1, 0.3, 1]

function useTypewriter(text, speed = 42, startDelay = 800) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(iv); setDone(true) }
      }, speed)
      return () => clearInterval(iv)
    }, startDelay)
    return () => clearTimeout(t)
  }, [text, speed, startDelay])
  return { displayed, done }
}

/* ─── waveform bars ─── */
function Waveform({ active }) {
  return (
    <div className="flex items-end gap-0.75 h-8">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-0.75 rounded-full bg-blue-500"
          animate={active ? {
            height: ["4px", `${6 + Math.random() * 22}px`, "4px"],
          } : { height: "4px" }}
          transition={active ? {
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          } : {}}
          style={{ height: "4px" }}
        />
      ))}
    </div>
  )
}

/* ─── feature card ─── */
const features = [
  {
    icon: "◎",
    title: "Voice-first booking",
    body: "Speak naturally. Our engine understands context, urgency, and preference — no forms, no friction.",
    accent: "#2563eb",
  },
  {
    icon: "⬡",
    title: "Clinical AI layer",
    body: "Symptom triage, specialist routing, and medication reminders handled before you hang up.",
    accent: "#0891b2",
  },
  {
    icon: "◈",
    title: "Zero-wait confirmation",
    body: "Real-time slot matching across 500+ provider calendars. Your slot, locked in seconds.",
    accent: "#7c3aed",
  },
]

/* ─── main component ─── */
export default function Landing() {
  const [voiceActive, setVoiceActive] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const { displayed, done } = useTypewriter(
    "Book Dr. Sharma · tomorrow · 5 PM", 48, 1200
  )

  /* trigger confirmed state after typing done */
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setConfirmed(true), 600)
    return () => clearTimeout(t)
  }, [done])

  /* auto-pulse waveform while typing */
  useEffect(() => {
    if (displayed.length > 0 && !done) setVoiceActive(true)
    else setVoiceActive(false)
  }, [displayed, done])

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#f8faff",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── google font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .serif { font-family: 'Instrument Serif', Georgia, serif; }

        .noise-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        .grid-rule {
          background-image:
            linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .underline-expand {
          position: relative;
          display: inline-block;
        }
        .underline-expand::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 0; height: 1.5px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .underline-expand:hover::after { width: 100%; }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 100px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #2563eb;
          background: rgba(37,99,235,0.05);
          font-weight: 500;
        }

        .card-voice {
          background: white;
          border: 1px solid #e5e9f2;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(37,99,235,0.06);
        }

        .feature-card {
          background: white;
          border: 1px solid #eef0f6;
          border-radius: 16px;
          padding: 32px 28px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .feature-card:hover {
          box-shadow: 0 8px 32px rgba(37,99,235,0.1);
          transform: translateY(-4px);
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: #dee4ef;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1d4ed8;
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .btn-primary:hover {
          background: #1e40af;
          box-shadow: 0 4px 16px rgba(29,78,216,0.4);
          transform: translateY(-1px);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 400;
          border: 1px solid #dde2ee;
          background: white;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .btn-ghost:hover {
          border-color: #93aae8;
          background: #f5f8ff;
          transform: translateY(-1px);
        }

        .gradient-text {
          background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .progress-track {
          height: 3px;
          background: #eef0f6;
          border-radius: 100px;
          overflow: hidden;
          margin-top: 20px;
        }

        .cursor-blink {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #2563eb;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.9s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .nav-link {
          font-size: 14px;
          color: #4b5563;
          font-weight: 400;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #111827; }
      `}</style>

      {/* ── subtle grid background ── */}
      <div className="noise-bg">
        <div
          className="grid-rule fixed inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />
      </div>

      {/* ── ambient orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="orb w-150 h-150 bg-blue-200 opacity-20 -top-60 -left-60" />
        <div className="orb w-96 h-96 bg-cyan-200 opacity-15 bottom-20 right-0" />
      </div>

      {/* ── content wrapper ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ══════════ NAVBAR ══════════ */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg,#2563eb,#0891b2)",
              borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a5 5 0 0 1 4 8l1.5 1.5-1.5 1.5L10.5 11.5A5 5 0 1 1 8 2Z" fill="white" fillOpacity="0.9" />
                <circle cx="8" cy="7" r="2" fill="white" />
              </svg>
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "-0.03em",
              color: "#111827",
            }}>
              MediVoice
            </span>
          </div>

          {/* links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {["Features", "Doctors", "Pricing"].map(l => (
              <span key={l} className="nav-link underline-expand" style={{ cursor: "pointer" }}>{l}</span>
            ))}
            <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
            <Link to="/login" className="nav-link underline-expand">Sign in</Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
                Get started →
              </Link>
            </motion.div>
          </div>
        </motion.nav>

        {/* ══════════ HERO ══════════ */}
        <section
          ref={heroRef}
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "72px 32px 80px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              <span className="tag-pill">
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 0 2px rgba(34,197,94,0.3)",
                  flexShrink: 0,
                }} />
                Live · 500+ doctors available now
              </span>
            </motion.div>

            <motion.h1
              className="serif"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              style={{
                fontSize: "clamp(44px, 5vw, 68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#0f1629",
                marginTop: 24,
              }}
            >
              Your health,
              <br />
              <span className="gradient-text" style={{ fontStyle: "italic" }}>
                one voice away.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.35 }}
              style={{
                marginTop: 24,
                fontSize: 17,
                lineHeight: 1.65,
                color: "#4b5563",
                maxWidth: 440,
                fontWeight: 300,
              }}
            >
              Book specialist appointments with a single voice command.
              AI-powered scheduling that works the way you think.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.5 }}
              style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" />
                    <path d="M6 5.5l4 2.5-4 2.5V5.5Z" fill="white" />
                  </svg>
                  Book appointment
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
              </motion.div>
            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{
                marginTop: 44,
                display: "flex",
                alignItems: "center",
                gap: 28,
              }}
            >
              {[
                { num: "10K+", label: "Appointments" },
                null,
                { num: "500+", label: "Doctors" },
                null,
                { num: "24 / 7", label: "Support" },
              ].map((stat, i) =>
                stat === null ? (
                  <div key={i} className="stat-divider" />
                ) : (
                  <div key={i}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>
                      {stat.num}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, letterSpacing: "0.03em" }}>
                      {stat.label}
                    </p>
                  </div>
                )
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT — voice card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
          >
            <div className="card-voice" style={{ padding: 32, maxWidth: 420, marginLeft: "auto" }}>

              {/* header */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                    border: "1px solid #bfdbfe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="5" y="1" width="6" height="9" rx="3" stroke="#2563eb" strokeWidth="1.5" />
                      <path d="M2.5 7.5A5.5 5.5 0 0 0 13.5 7.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8" y1="13" x2="8" y2="15" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Voice Input</p>
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>AI is listening…</p>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, color: "#22c55e", fontWeight: 500,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  padding: "3px 10px", borderRadius: 100,
                }}>● Active</span>
              </div>

              {/* waveform */}
              <div style={{
                background: "#f8faff",
                border: "1px solid #eef0f6",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <Waveform active={voiceActive} />
              </div>

              {/* transcript bubble */}
              <div style={{
                background: "#f0f7ff",
                border: "1px solid #dbeafe",
                borderRadius: 12,
                padding: "14px 18px",
                fontSize: 15,
                color: "#1e40af",
                fontWeight: 400,
                minHeight: 52,
                lineHeight: 1.5,
              }}>
                "{displayed}"
                {!done && <span className="cursor-blink" />}
              </div>

              {/* confirmation */}
              <AnimatePresence>
                {confirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                    style={{
                      marginTop: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="#22c55e" />
                      <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>
                      Appointment confirmed — Dr. Sharma, 5 PM tomorrow
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* progress bar */}
              <div className="progress-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: confirmed ? "100%" : done ? "85%" : `${(displayed.length / 36) * 75}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#2563eb,#0891b2)",
                    borderRadius: 100,
                  }}
                />
              </div>

              {/* footer meta */}
              <div style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>Encrypted · HIPAA compliant</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {["Dr. S", "Dr. A", "Dr. R"].map((d, i) => (
                    <div key={i} style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: `hsl(${210 + i * 25}, 80%, ${60 + i * 6}%)`,
                      border: "2px solid white",
                      marginLeft: i > 0 ? -8 : 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, color: "white", fontWeight: 700,
                    }}>
                      {d[3]}
                    </div>
                  ))}
                  <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6 }}>+497 online</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px 96px",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            style={{ marginBottom: 44 }}
          >
            <p style={{
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#2563eb", fontWeight: 600, marginBottom: 12,
            }}>
              CAPABILITIES
            </p>
            <h2 className="serif" style={{
              fontSize: 36, fontWeight: 400, color: "#0f1629",
              letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              Everything you need,
              <span style={{ fontStyle: "italic", color: "#2563eb" }}> nothing you don't.</span>
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.accent}12`,
                  border: `1px solid ${f.accent}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: f.accent,
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontSize: 16, fontWeight: 600, color: "#111827",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, fontWeight: 300 }}>
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════ CTA BAND ══════════ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px 96px",
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)",
            borderRadius: 24,
            padding: "56px 64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* bg texture */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)",
            }} />
            <div style={{ position: "relative" }}>
              <h2 className="serif" style={{
                fontSize: 32, color: "white",
                letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                Ready to speak to better healthcare?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 10, fontSize: 15, fontWeight: 300 }}>
                Join 10,000+ patients who book in under 30 seconds.
              </p>
            </div>
            <div style={{ flexShrink: 0, position: "relative" }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "white", color: "#1d4ed8",
                  padding: "14px 28px", borderRadius: 12,
                  fontWeight: 600, fontSize: 15,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  transition: "box-shadow 0.2s",
                }}>
                  Get started free →
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{
          borderTop: "1px solid #eef0f6",
          padding: "28px 32px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            © 2026 MediVoice — Built by Hithesh
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <span key={l} className="underline-expand" style={{
                fontSize: 13, color: "#9ca3af", cursor: "pointer",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "#4b5563"}
                onMouseLeave={e => e.target.style.color = "#9ca3af"}
              >
                {l}
              </span>
            ))}
          </div>
        </footer>

      </div>
    </div>
  )
}