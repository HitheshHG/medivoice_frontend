import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6 15v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M13 9A6 6 0 0 1 6 2a6 6 0 1 0 7 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3 3l1 1M11 11l1 1M11 3l-1 1M3 11l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const menu = [
  { name: "Dashboard", path: "/dashboard", Icon: HomeIcon },
  { name: "Appointments", path: "/appointments", Icon: CalIcon },
  { name: "Profile", path: "/profile", Icon: UserIcon },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark")
  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem("user")
      if (s && s !== "undefined") setUser(JSON.parse(s))
    } catch { setUser(null) }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])

  const logout = () => { localStorage.clear(); navigate("/login") }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        .sidebar-root * { box-sizing: border-box; }
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 14px; font-weight: 400; color: #4b5563;
          text-decoration: none; position: relative;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .nav-item:hover { background: #f3f4f6; color: #111827; }
        .nav-item.active { background: #eff6ff; color: #1d4ed8; font-weight: 600; }
        .nav-item.active::before {
          content: ''; position: absolute; left: 0; top: 20%; height: 60%;
          width: 3px; background: #1d4ed8; border-radius: 0 2px 2px 0;
        }
        .bottom-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px; border-radius: 10px;
          font-size: 13px; font-weight: 400; cursor: pointer;
          background: none; border: none; font-family: inherit;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .bottom-btn:hover { background: #f3f4f6; }
        .collapse-btn {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 8px; color: #9ca3af;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .collapse-btn:hover { background: #f3f4f6; color: #374151; }
      `}</style>

      <div
        className="sidebar-root"
        style={{
          width: collapsed ? 64 : 240,
          minHeight: "100vh",
          background: "white",
          borderRight: "1px solid #eef0f6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: collapsed ? "20px 10px" : "24px 16px",
          transition: "width 0.25s cubic-bezier(0.16,1,0.3,1), padding 0.25s",
          flexShrink: 0,
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          boxShadow: "1px 0 0 #eef0f6",
          position: "relative",
        }}
      >
        <div>
          {/* header */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            marginBottom: 28,
          }}>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg,#2563eb,#0891b2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="1" width="6" height="9" rx="3" stroke="white" strokeWidth="1.4" />
                    <path d="M2.5 7.5A5.5 5.5 0 0 0 13.5 7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="8" y1="13" x2="8" y2="15" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>
                  MediVoice
                </span>
              </div>
            )}
            <button className="collapse-btn" onClick={() => setCollapsed(v => !v)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {collapsed
                  ? <path d="M3 2h8M3 7h8M3 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M3 2h8M3 7h5M3 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                }
              </svg>
            </button>
          </div>

          {/* user card */}
          {!collapsed ? (
            <div style={{
              background: "linear-gradient(135deg, #f0f7ff, #fafcff)",
              border: "1px solid #dbeafe",
              borderRadius: 14, padding: "14px 16px",
              marginBottom: 24, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 12, right: 12,
                width: 7, height: 7, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
              }} />
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: "linear-gradient(135deg, #2563eb, #0891b2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: "white",
                marginBottom: 10,
              }}>
                {initials}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", letterSpacing: "-0.01em" }}>
                {user?.name || "User"}
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                {user?.email || ""}
              </p>
            </div>
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 11, margin: "0 auto 20px",
              background: "linear-gradient(135deg, #2563eb, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "white", position: "relative",
            }}>
              {initials}
              <div style={{
                position: "absolute", top: -2, right: -2,
                width: 8, height: 8, borderRadius: "50%",
                background: "#22c55e", border: "2px solid white",
              }} />
            </div>
          )}

          {/* section label */}
          {!collapsed && (
            <p style={{
              fontSize: 10, fontWeight: 600, color: "#9ca3af",
              letterSpacing: "0.1em", textTransform: "uppercase",
              paddingLeft: 12, marginBottom: 6,
            }}>
              MENU
            </p>
          )}

          {/* nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {menu.map(({ name, path, Icon }) => {
              const active = location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-item ${active ? "active" : ""}`}
                  title={collapsed ? name : undefined}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <span style={{ flexShrink: 0 }}><Icon /></span>
                  {!collapsed && name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* bottom */}
        <div>
          {!collapsed && (
            <div style={{
              height: 1, background: "#eef0f6", margin: "12px 0",
            }} />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>

            <button
              className="bottom-btn"
              onClick={logout}
              title={collapsed ? "Sign out" : undefined}
              style={{
                color: "#ef4444",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ flexShrink: 0 }}><LogoutIcon /></span>
              {!collapsed && "Sign out"}
            </button>
          </div>

          {!collapsed && (
            <p style={{
              fontSize: 10, color: "#d1d5db", textAlign: "center",
              marginTop: 16, letterSpacing: "0.04em",
            }}>
              MEDIVOICE © 2026
            </p>
          )}
        </div>
      </div>
    </>
  )
}