import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { Toaster } from "react-hot-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
          fontSize: "14px",
          fontWeight: "400",
          borderRadius: "10px",
          padding: "12px 16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        },
        success: {
          style: {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#f0fdf4",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fef2f2",
          },
        },
      }}
    />
  </React.StrictMode>
)