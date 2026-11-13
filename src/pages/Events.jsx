import { useEffect, useState } from "react";
import api from "../api/api.js";

const emptyForm = {
  eventType: "birthday",
  date: "",
  time: "",
  guestCount: 8,
  menuSelection: [],
  additionalRequirements: "",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadEvents() {
    api
      .get("/events")
      .then(({ data }) => setEvents(data))
      .finally(() => setLoading(false));
  }

  // Load once, then refresh every 20 seconds so status changes show up without reloading.
  useEffect(() => {
    loadEvents();
    const timer = setInterval(() => {
      if (!document.hidden) loadEvents();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api
      .get("/menu")
      .then(({ data }) => setMenuItems(data))
      .catch(() => setMenuItems([]));
  }, []);

  function toggleDish(id) {
    setForm((prev) => ({
      ...prev,
      menuSelection: prev.menuSelection.includes(id)
        ? prev.menuSelection.filter((d) => d !== id)
        : [...prev.menuSelection, id],
    }));
  }

  function startEdit(ev) {
    setEditingId(ev._id);
    setForm({
      eventType: ev.eventType,
      date: ev.date,
      time: ev.time,
      guestCount: ev.guestCount,
      menuSelection: (ev.menuSelection || []).map((m) => m._id || m),
      additionalRequirements: ev.additionalRequirements || "",
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
        await api.put(`/events/${editingId}`, form, { skipGlobalError: true });
        setSuccess("Event request updated.");
        setEditingId(null);
      } else {
        await api.post("/events", form, { skipGlobalError: true });
        setSuccess("Event request submitted — an admin will confirm shortly.");
      }
      setForm(emptyForm);
      loadEvents();
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Could not save that event request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this event request?")) return;
    try {
      await api.delete(`/events/${id}`);
      if (editingId === id) cancelEdit();
      loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the event request.");
    }
  }

  return (
    <div className="container page">
      <h2>Special events</h2>
      <p>Birthday parties, corporate gatherings, and other celebrations.</p>
      <div className="grid-2">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit event request" : "Request an event"}</h3>
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
              max={100}
              required
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
            />
          </div>
          <div className="form-field">
            <label>Menu selection (optional)</label>
            <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              {menuItems.length === 0 && <span className="muted">Menu unavailable right now.</span>}
              {menuItems.map((m) => (
                <label key={m._id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    style={{ width: "auto" }}
                    checked={form.menuSelection.includes(m._id)}
                    onChange={() => toggleDish(m._id)}
                  />
                  {m.name} <span className="muted">(${m.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
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
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update request" : "Submit request"}
            </button>
            {editingId && (
              <button className="btn-ghost" type="button" onClick={cancelEdit}>
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div>
          <h3>Your event requests</h3>
          {loading && <p className="muted">Loading event requests…</p>}
          {!loading && events.length === 0 && <div className="empty-state">No event requests yet.</div>}
          {events.map((ev) => (
            <div key={ev._id} className="cart-panel" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ textTransform: "capitalize" }}>{ev.eventType}</strong>
                <span className={`status-badge status-${ev.status}`}>{ev.status}</span>
              </div>
              <p className="muted">
                {ev.date} at {ev.time} · {ev.guestCount} guests
                {ev.menuSelection?.length > 0 && (
                  <>
                    <br />
                    Menu: {ev.menuSelection.map((m) => m.name).join(", ")}
                  </>
                )}
              </p>
              {ev.status !== "cancelled" && (
                <div style={{ display: "flex", gap: 16 }}>
                  {ev.status === "pending" && (
                    <button className="btn-ghost" onClick={() => startEdit(ev)}>
                      Edit
                    </button>
                  )}
                  <button className="btn-ghost" onClick={() => handleCancel(ev._id)}>
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
