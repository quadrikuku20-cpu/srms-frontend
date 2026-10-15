import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page">Loading orders…</div>;

  return (
    <div className="container page">
      <h2>My orders</h2>
      {orders.length === 0 && <div className="empty-state">No orders yet.</div>}
      {orders.map((order) => (
        <div key={order._id} className="cart-panel" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            <span className={`status-badge status-${order.status}`}>{order.status}</span>
          </div>
          <p className="muted">
            {order.fulfillmentType === "delivery" ? `Delivery to ${order.deliveryAddress}` : "Pickup"}
          </p>
          <ul style={{ margin: "8px 0", paddingLeft: 18 }}>
            {order.items.map((i, idx) => (
              <li key={idx}>
                {i.quantity} × {i.name}
              </li>
            ))}
          </ul>
          <strong>Total: ${order.totalPrice.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}