import { useEffect, useState } from "react";
import api from "../../api/api.js";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  function loadAll() {
    const reservationsReq = api.get("/reservations").then(({ data }) => setReservations(data));
    const eventsReq = api.get("/events").then(({ data }) => setEvents(data));
    Promise.allSettled([reservationsReq, eventsReq]).then(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    const timer = setInterval(() => {
      if (!document.hidden) loadAll();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  async function updateReservationStatus(id, status) {
    await api.put(`/reservations/${id}/status`, { status });
    loadAll();
  }

  async function updateEventStatus(id, status) {
    await api.put(`/events/${id}/status`, { status });
    loadAll();
  }

  return (
    <div>
      <h3>Reservations</h3>
      {loading && <p className="muted">Loading…</p>}
      {!loading && reservations.length === 0 && <div className="empty-state">No reservations yet.</div>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Date / Time</th>
            <th>Table</th>
            <th>Party</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r._id}>
              <td>{r.customer?.name || "—"}</td>
              <td>
                {r.date} {r.time}
              </td>
              <td>{r.tableNumber}</td>
              <td>{r.partySize}</td>
              <td style={{ textTransform: "capitalize" }}>{r.reservationType || "dining"}</td>
              <td>
                <select value={r.status} onChange={(e) => updateReservationStatus(r._id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reservations.length === 0 && <div className="empty-state">No reservations yet.</div>}

      <hr className="section-divider" />

      <h3>Special events</h3>
      {!loading && events.length === 0 && <div className="empty-state">No event requests yet.</div>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Type</th>
            <th>Date / Time</th>
            <th>Guests</th>
            <th>Menu</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev._id}>
              <td>{ev.customer?.name || "—"}</td>
              <td style={{ textTransform: "capitalize" }}>{ev.eventType}</td>
              <td>
                {ev.date} {ev.time}
              </td>
              <td>{ev.guestCount}</td>
              <td>{ev.menuSelection?.map((m) => m.name).join(", ") || "-"}</td>
              <td>
                <select value={ev.status} onChange={(e) => updateEventStatus(ev._id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.length === 0 && <div className="empty-state">No event requests yet.</div>}
    </div>
  );
}