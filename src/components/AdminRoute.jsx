import { Navigate, useLocation } from "react-router-dom"

export default function AdminRoute({ children }) {
  const token    = localStorage.getItem("token")
  const location = useLocation()

  const user = (() => {
    try {
      const s = localStorage.getItem("user")
      return s && s !== "undefined" ? JSON.parse(s) : null
    } catch {
      return null
    }
  })()

  if (!token) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}