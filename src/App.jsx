import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import Dashboard from "./pages/Dashboard"
import MyAppointments from "./pages/MyAppointments"
import Profile from "./pages/Profile"

import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f8faff", gap: 16, textAlign: "center", padding: 24,
    }}>
      <p style={{ fontSize: 64, lineHeight: 1 }}>404</p>
      <p style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Page not found</p>
      <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{
        marginTop: 8, padding: "11px 24px", borderRadius: 10,
        background: "#1d4ed8", color: "white", textDecoration: "none",
        fontSize: 14, fontWeight: 500,
      }}>
        Back to home
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}