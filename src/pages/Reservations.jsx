import { useEffect, useState } from "react";
import api from "../api/api.js";

const emptyForm = { date: "", time: "", partySize: 2, reservationType: "dining", specialRequests: "" };

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadReservations() {
    api.get("/reservations").then(({ data }) => setReservations(data));
  }

  // Load once, then refresh every 20 seconds so status changes show up without reloading.
  useEffect(() => {
    loadReservations();
    const timer = setInterval(() => {
      if (!document.hidden) loadReservations();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  function startEdit(r) {
    setEditingId(r._id);
    setForm({
      date: r.date,
      time: r.time,
      partySize: r.partySize,
      reservationType: r.reservationType || "dining",
      specialRequests: r.specialRequests || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (editingId) {
        const { data } = await api.put(`/reservations/${editingId}`, form, { skipGlobalError: true });
        setSuccess(`Reservation updated: table ${data.tableNumber} on ${data.date} at ${data.time}.`);
        setEditingId(null);
      } else {
        const { data } = await api.post("/reservations", form, { skipGlobalError: true });
        setSuccess(`Table ${data.tableNumber} booked for ${data.date} at ${data.time}.`);
      }
      setForm(emptyForm);
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save that reservation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      if (editingId === id) cancelEdit();
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the reservation.");
    }
  }

  return (
    <div className="container page">
      <h2>Reservations</h2>
      <div className="grid-2">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit reservation" : "Book a table"}</h3>
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
            <label htmlFor="rtype">Reservation type</label>
            <select
              id="rtype"
              value={form.reservationType}
              onChange={(e) => setForm({ ...form, reservationType: e.target.value })}
            >
              <option value="dining">Dining</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
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
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update reservation" : "Book table"}
            </button>
            {editingId && (
              <button className="btn-ghost" type="button" onClick={cancelEdit}>
                Cancel edit
              </button>
            )}
          </div>
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
                Table {r.tableNumber} · Party of {r.partySize} ·{" "}
                <span style={{ textTransform: "capitalize" }}>{r.reservationType || "dining"}</span>
              </p>
              {r.status !== "cancelled" && (
                <div style={{ display: "flex", gap: 16 }}>
                  <button className="btn-ghost" onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button className="btn-ghost" onClick={() => handleCancel(r._id)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
