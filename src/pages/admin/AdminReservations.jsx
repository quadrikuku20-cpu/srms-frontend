import { useEffect, useState } from "react";
import api from "../../api/api.js";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);

  function loadAll() {
    api.get("/reservations").then(({ data }) => setReservations(data));
    api.get("/events").then(({ data }) => setEvents(data));
  }

  useEffect(loadAll, []);

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
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Date / Time</th>
            <th>Table</th>
            <th>Party</th>
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
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Type</th>
            <th>Date / Time</th>
            <th>Guests</th>
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