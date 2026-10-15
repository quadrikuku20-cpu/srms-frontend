import { useEffect, useState } from "react";
import api from "../../api/api.js";

const STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  function loadOrders() {
    api.get("/orders").then(({ data }) => setOrders(data));
  }

  useEffect(loadOrders, []);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    loadOrders();
  }

  return (
    <div>
      <h3>Incoming orders</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Items</th>
            <th>Type</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customer?.name || "—"}</td>
              <td>{order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
              <td style={{ textTransform: "capitalize" }}>{order.fulfillmentType}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>
                <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <div className="empty-state">No orders yet.</div>}
    </div>
  );
}