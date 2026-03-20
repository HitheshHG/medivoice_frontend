const pool = require("../config/db")

/* ─────────────────────────────────────────────
   TIME PARSING
───────────────────────────────────────────── */
const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
}

function wordToNumber(word) {
  return WORD_NUMBERS[word.toLowerCase()] ?? null
}

function parseTime(text) {
  const t = text.toLowerCase().trim()

  if (/\bnoon\b|\bmidday\b/.test(t)) return "12:00"
  if (/\bmidnight\b/.test(t)) return "00:00"

  const halfPast = t.match(/half\s+past\s+(\w+)/)
  if (halfPast) {
    const raw = halfPast[1]
    const h = isNaN(parseInt(raw)) ? wordToNumber(raw) : parseInt(raw)
    if (h != null) return `${String(h % 12 || 12).padStart(2, "0")}:30`
  }

  const qPast = t.match(/quarter\s+past\s+(\w+)/)
  if (qPast) {
    const raw = qPast[1]
    const h = isNaN(parseInt(raw)) ? wordToNumber(raw) : parseInt(raw)
    if (h != null) return `${String(h % 12 || 12).padStart(2, "0")}:15`
  }

  const qTo = t.match(/quarter\s+to\s+(\w+)/)
  if (qTo) {
    const raw = qTo[1]
    const hRaw = isNaN(parseInt(raw)) ? wordToNumber(raw) : parseInt(raw)
    const h = hRaw - 1
    if (h != null && h >= 0) return `${String(h % 12 || 12).padStart(2, "0")}:45`
  }

  const colonFmt = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/)
  if (colonFmt) {
    let h = parseInt(colonFmt[1])
    const m = colonFmt[2]
    const meridiem = colonFmt[3]
    if (meridiem === "pm" && h !== 12) h += 12
    if (meridiem === "am" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:${m}`
  }

  const simpleFmt = t.match(/\bat\s+(\d{1,2})\s*(am|pm)?|\b(\d{1,2})\s*(am|pm)\b/)
  if (simpleFmt) {
    let h = parseInt(simpleFmt[1] ?? simpleFmt[3])
    const meridiem = (simpleFmt[2] ?? simpleFmt[4] ?? "").toLowerCase()
    if (meridiem === "pm" && h !== 12) h += 12
    if (meridiem === "am" && h === 12) h = 0
    return `${String(h).padStart(2, "0")}:00`
  }

  const parts = t.split(/\s+/)
  const nums = parts.map(wordToNumber).filter(n => n !== null)
  if (nums.length === 1) return `${String(nums[0]).padStart(2, "0")}:00`
  if (nums.length === 2) return `${String(nums[0]).padStart(2, "0")}:${String(nums[1]).padStart(2, "0")}`

  return null
}

/* ─────────────────────────────────────────────
   DATE PARSING
   Uses local calendar date, not UTC, to avoid
   off-by-one day for India (UTC+5:30).
───────────────────────────────────────────── */
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

function localDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

function parseDate(text) {
  const t = text.toLowerCase()
  const now = new Date()

  if (/\btoday\b/.test(t)) return localDateStr(now)

  if (/\btomorrow\b/.test(t)) {
    const d = new Date(now)
    d.setDate(d.getDate() + 1)
    return localDateStr(d)
  }

  for (let i = 0; i < DAYS.length; i++) {
    if (t.includes(DAYS[i])) {
      const isNext = t.includes("next")
      const target = new Date(now)
      const diff = (i - now.getDay() + 7) % 7 || 7
      target.setDate(now.getDate() + (isNext ? diff + 7 : diff))
      return localDateStr(target)
    }
  }

  return localDateStr(now)
}

/* ─────────────────────────────────────────────
   INTENT DETECTION
───────────────────────────────────────────── */
function detectIntent(text) {
  const t = text.toLowerCase()

  const bookPatterns = [/\bbook\b/, /\bschedule\b/, /\bneed a slot\b/, /\bget a slot\b/, /\bmake.+appointment\b/]
  const cancelPatterns = [/\bcancel\b/, /\bremove\b/, /\bdelete my appointment\b/, /\bcall off\b/, /\bdon't need.+appointment\b/]
  const listPatterns = [/\bmy appointment\b/, /\bshow.+slot\b/, /\bcheck.+appointment\b/, /\bwhat.+appointment\b/]

  if (cancelPatterns.some(r => r.test(t))) return "cancel"
  if (bookPatterns.some(r => r.test(t))) return "book"
  if (listPatterns.some(r => r.test(t))) return "list"
  return "unknown"
}

/* ─────────────────────────────────────────────
   CONTROLLER
───────────────────────────────────────────── */
exports.processVoice = async (req, res) => {
  const client = await pool.connect()

  try {
    const { text } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: "No voice text provided." })
    }

    const user_id = req.user.id
    const intent = detectIntent(text)

    /* ── CANCEL ── */
    if (intent === "cancel") {
      await client.query("BEGIN")

      const appt = await client.query(
        `SELECT * FROM appointments
         WHERE user_id = $1 AND status = 'booked'
         ORDER BY created_at DESC LIMIT 1
         FOR UPDATE`,
        [user_id]
      )

      if (!appt.rows.length) {
        await client.query("ROLLBACK")
        return res.json({ message: "You have no active appointment to cancel." })
      }

      await client.query(
        "UPDATE appointments SET status = 'cancelled' WHERE id = $1",
        [appt.rows[0].id]
      )
      await client.query(
        "UPDATE slots SET is_booked = FALSE WHERE id = $1",
        [appt.rows[0].slot_id]
      )

      await client.query("COMMIT")
      return res.json({ message: "Your appointment has been cancelled." })
    }

    /* ── BOOK ── */
    if (intent === "book") {
      const timeStr = parseTime(text)
      const dateStr = parseDate(text)

      if (!timeStr) {
        return res.json({
          message: "I couldn't understand the time. Try saying 'book an appointment tomorrow at 5 PM'.",
        })
      }

      await client.query("BEGIN")

      /*
       * FIX: replaced  `time::text LIKE $2`  with  `time::time = $2::time`
       *
       * The old LIKE approach broke because PostgreSQL renders a time column
       * as text in different formats depending on the column type and pg version:
       *   - time             →  "17:00:00"
       *   - time(6)          →  "17:00:00.000000"   (. after seconds)
       *   - timetz           →  "17:00:00+05:30"
       *
       * LIKE '17:00%' is also fragile — it would accidentally match
       * "17:00" and "17:009" (if such a value existed).
       *
       * Casting both sides to ::time lets PostgreSQL do a proper
       * time-value comparison regardless of how it is stored or formatted.
       * parseTime() always returns a valid "HH:MM" string, which PostgreSQL
       * happily casts to a time value.
       */
      const slot = await client.query(
        `SELECT * FROM slots
         WHERE date = $1
           AND time::time = $2::time
           AND is_booked = FALSE
         ORDER BY time ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
        [dateStr, timeStr]
      )

      if (!slot.rows.length) {
        await client.query("ROLLBACK")
        return res.json({
          message: `No available slot on ${dateStr} at ${timeStr}. Try a different time or date.`,
        })
      }

      const appointment = await client.query(
        `INSERT INTO appointments (user_id, slot_id, status)
         VALUES ($1, $2, 'booked')
         RETURNING *`,
        [user_id, slot.rows[0].id]
      )

      await client.query(
        "UPDATE slots SET is_booked = TRUE WHERE id = $1",
        [slot.rows[0].id]
      )

      await client.query("COMMIT")

      const friendly = new Date(`1970-01-01T${slot.rows[0].time}`)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })

      return res.json({
        message: `Appointment booked for ${dateStr} at ${friendly}.`,
        appointment: appointment.rows[0],
      })
    }

    /* ── LIST ── */
    if (intent === "list") {
      const appts = await client.query(
        `SELECT a.*, s.date, s.time FROM appointments a
         JOIN slots s ON s.id = a.slot_id
         WHERE a.user_id = $1 AND a.status = 'booked'
         ORDER BY s.date ASC, s.time ASC
         LIMIT 3`,
        [user_id]
      )

      if (!appts.rows.length) {
        return res.json({ message: "You have no upcoming appointments." })
      }

      const lines = appts.rows.map(r => {
        const t = new Date(`1970-01-01T${r.time}`)
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
        return `${r.date} at ${t}`
      })

      return res.json({ message: `Your appointments: ${lines.join("; ")}.` })
    }

    /* ── UNKNOWN ── */
    return res.json({
      message: "Sorry, I didn't understand that. Try: 'book appointment tomorrow at 3 PM' or 'cancel my appointment'.",
    })

  } catch (err) {
    await client.query("ROLLBACK").catch(() => { })
    console.error("[voiceController]", err)
    res.status(500).json({ message: "Something went wrong. Please try again." })
  } finally {
    client.release()
  }
}