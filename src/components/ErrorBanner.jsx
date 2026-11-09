import { useEffect, useState } from "react";

export default function ErrorBanner() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    function onError(e) {
      setMessage(e.detail);
    }
    window.addEventListener("srms:error", onError);
    return () => window.removeEventListener("srms:error", onError);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        maxWidth: "90vw",
        background: "var(--rust)",
        color: "var(--cream)",
        padding: "10px 16px",
        borderRadius: 8,
        display: "flex",
        gap: 12,
        alignItems: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
      }}
    >
      <span>{message}</span>
      <button
        onClick={() => setMessage("")}
        aria-label="Dismiss"
        style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.2rem" }}
      >
        ×
      </button>
    </div>
  );
}
