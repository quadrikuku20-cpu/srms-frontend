import { useEffect, useState } from "react";
import api from "../api/api.js";

const emptyForm = { eventType: "birthday", date: "", time: "", guestCount: 8, additionalRequirements: "" };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadEvents() {
    api.get("/events").then(({ data }) => setEvents(data));
  }

  useEffect(loadEvents, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/events", form);
      setSuccess("Event request submitted — an admin will confirm shortly.");
      setForm(emptyForm);
      loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit that event request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    await api.delete(`/events/${id}`);
    loadEvents();
  }

  return (
    <div className="container page">
      <h2>Special events</h2>
      <p>Birthday parties, corporate gatherings, and other celebrations.</p>
      <div className="grid-2">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Request an event</h3>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <div className="form-field">
            <label htmlFor="eventType">Event type</label>
            <select
              id="eventType"
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            >
              <option value="birthday">Birthday</option>
              <option value="corporate">Corporate</option>
              <option value="anniversary">Anniversary</option>
              <option value="other">Other</option>
            </select>
          </div>
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
            <label htmlFor="guests">Guest count</label>
            <input
              id="guests"
              type="number"
              min={1}
              required
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="reqs">Additional requirements</label>
            <textarea
              id="reqs"
              rows={2}
              value={form.additionalRequirements}
              onChange={(e) => setForm({ ...form, additionalRequirements: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </form>

        <div>
          <h3>Your event requests</h3>
          {events.length === 0 && <div className="empty-state">No event requests yet.</div>}
          {events.map((ev) => (
            <div key={ev._id} className="cart-panel" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ textTransform: "capitalize" }}>{ev.eventType}</strong>
                <span className={`status-badge status-${ev.status}`}>{ev.status}</span>
              </div>
              <p className="muted">
                {ev.date} at {ev.time} · {ev.guestCount} guests
              </p>
              {ev.status !== "cancelled" && (
                <button className="btn-ghost" onClick={() => handleCancel(ev._id)}>
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