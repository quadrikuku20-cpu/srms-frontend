import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadOrders() {
    api
      .get("/orders")
      .then(({ data }) => {
        setOrders(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load your orders."))
      .finally(() => setLoading(false));
  }

  // Load once, then refresh every 20 seconds so status changes show up without reloading.
  useEffect(() => {
    loadOrders();
    const timer = setInterval(() => {
      if (!document.hidden) loadOrders();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the order.");
    }
  }

  if (loading) return <div className="container page">Loading orders…</div>;

  return (
    <div className="container page">
      <h2>My orders</h2>
      {error && <div className="form-error">{error}</div>}
      {!error && orders.length === 0 && <div className="empty-state">No orders yet.</div>}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Total: ${order.totalPrice.toFixed(2)}</strong>
            {order.status === "pending" && (
              <button className="btn btn-danger" onClick={() => handleCancel(order._id)}>
                Cancel order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
