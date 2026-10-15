import { useEffect, useState } from "react";
import api from "../api/api.js";

const emptyForm = { date: "", time: "", partySize: 2, specialRequests: "" };

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadReservations() {
    api.get("/reservations").then(({ data }) => setReservations(data));
  }

  useEffect(loadReservations, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/reservations", form);
      setSuccess(`Table ${data.tableNumber} booked for ${data.date} at ${data.time}.`);
      setForm(emptyForm);
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || "Could not book that table.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    await api.delete(`/reservations/${id}`);
    loadReservations();
  }

  return (
    <div className="container page">
      <h2>Reservations</h2>
      <div className="grid-2">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Book a table</h3>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="party">Party size</label>
            <input
              id="party"
              type="number"
              min={1}
              max={20}
              required
              value={form.partySize}
              onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="requests">Special requests (optional)</label>
            <textarea
              id="requests"
              rows={2}
              value={form.specialRequests}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Booking…" : "Book table"}
          </button>
        </form>

        <div>
          <h3>Upcoming reservations</h3>
          {reservations.length === 0 && <div className="empty-state">No reservations yet.</div>}
          {reservations.map((r) => (
            <div key={r._id} className="cart-panel" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {r.date} at {r.time}
                </strong>
                <span className={`status-badge status-${r.status}`}>{r.status}</span>
              </div>
              <p className="muted">
                Table {r.tableNumber} · Party of {r.partySize}
              </p>
              {r.status !== "cancelled" && (
                <button className="btn-ghost" onClick={() => handleCancel(r._id)}>
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}