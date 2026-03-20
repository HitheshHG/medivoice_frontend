import axios from "../api/axios"
import { useState, useRef } from "react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const COMMANDS = [
  "Book an appointment tomorrow at 5 PM",
  "Book on the 20th at 10 AM",
  "Book on Friday at 3 PM",
  "Cancel my appointment",
  "Reschedule to Monday at 2 PM",
  "What slots are available today?",
  "Show my appointments",
  "When is my next appointment?",
]

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="6" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="11" r="0.6" fill="currentColor"/>
    </svg>
  )
}

function Waveform() {
  const bars = [3, 6, 10, 14, 10, 6, 3, 5, 12, 8, 4]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          style={{ width: 2.5, borderRadius: 100, background: "white", display: "block" }}
          animate={{ height: [`${h}px`, `${Math.max(3, h + (Math.random() > 0.5 ? 6 : -3))}px`, `${h}px`] }}
          transition={{ duration: 0.45 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export default function VoiceButton({ reload }) {
  const [state, setState]           = useState("idle") // idle | listening | processing
  const [transcript, setTranscript] = useState("")
  const [showHelp, setShowHelp]     = useState(false)
  const recognitionRef              = useRef(null)

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return }

    setShowHelp(false)

    if (!recognitionRef.current) {
      const rec = new SR()
      rec.lang           = "en-US"
      rec.continuous     = false
      rec.interimResults = false

      rec.onstart = () => { setState("listening"); setTranscript("") }

      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript
        setTranscript(text)
        setState("processing")
        try {
          const res = await axios.post("/voice", { text })
          toast.success(res.data.message || "Done", { duration: 5000 })
          reload?.()
        } catch {
          toast.error("Voice command failed")
        } finally {
          setState("idle")
          setTimeout(() => setTranscript(""), 3000)
        }
      }

      rec.onerror = (e) => {
        setState("idle")
        if (e.error !== "no-speech") toast.error("Microphone error")
      }
      rec.onend = () => { if (state === "listening") setState("idle") }

      recognitionRef.current = rec
    }

    try { recognitionRef.current.start() }
    catch { recognitionRef.current = null }
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setState("idle")
  }

  const isListening  = state === "listening"
  const isProcessing = state === "processing"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>

      {/* transcript bubble */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{
              maxWidth: 300, padding: "9px 14px",
              background: "white", border: "1px solid #e5e9f2",
              borderRadius: 12, fontSize: 13, color: "#374151",
              boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ color: "#9ca3af", marginRight: 6, fontSize: 11 }}>You said</span>
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* help panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 300, background: "white",
              border: "1px solid #e5e9f2", borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              Example commands
            </p>
            {COMMANDS.map((cmd, i) => (
              <div
                key={i}
                onClick={() => {
                  setShowHelp(false)
                  // simulate clicking mic then sending this text
                  setState("processing")
                  setTranscript(cmd)
                  axios.post("/voice", { text: cmd })
                    .then(res => { toast.success(res.data.message || "Done", { duration: 5000 }); reload?.() })
                    .catch(() => toast.error("Command failed"))
                    .finally(() => { setState("idle"); setTimeout(() => setTranscript(""), 3000) })
                }}
                style={{
                  padding: "7px 10px", borderRadius: 8,
                  fontSize: 12.5, color: "#374151",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  marginBottom: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f3f7ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                🎤 {cmd}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* buttons row */}
      <div style={{ display: "flex", gap: 8 }}>
        {/* help toggle */}
        <motion.button
          onClick={() => setShowHelp(s => !s)}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "11px 14px", borderRadius: 12,
            border: `1px solid ${showHelp ? "#bfdbfe" : "#e5e9f2"}`,
            background: showHelp ? "#eff6ff" : "white",
            color: showHelp ? "#1d4ed8" : "#9ca3af",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          title="Show example commands"
        >
          <HelpIcon />
        </motion.button>

        {/* mic button */}
        <motion.button
          onClick={isListening ? stop : start}
          disabled={isProcessing}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 20px", borderRadius: 12,
            border: "none", cursor: isProcessing ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500,
            transition: "box-shadow 0.2s",
            background: isListening
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : isProcessing
              ? "linear-gradient(135deg, #6b7280, #4b5563)"
              : "linear-gradient(135deg, #1d4ed8, #1e40af)",
            color: "white",
            boxShadow: isListening
              ? "0 4px 16px rgba(239,68,68,0.35)"
              : isProcessing ? "none"
              : "0 2px 8px rgba(29,78,216,0.3)",
            position: "relative", overflow: "hidden",
          }}
        >
          {isListening && (
            <motion.span
              style={{
                position: "absolute", inset: 0, borderRadius: 12,
                border: "2px solid rgba(255,255,255,0.4)",
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          )}

          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.span key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Waveform />
                Stop
              </motion.span>
            ) : isProcessing ? (
              <motion.span key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg style={{ animation: "spin 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Processing…
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MicIcon />
                Voice
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}