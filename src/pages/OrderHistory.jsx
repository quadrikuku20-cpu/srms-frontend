import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing state: which order is open in the editor, and the draft being changed
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

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

  // The menu is needed so dishes can be added while editing.
  useEffect(() => {
    api
      .get("/menu")
      .then(({ data }) => setMenu(data))
      .catch(() => setMenu([]));
  }, []);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      if (editingId === id) closeEditor();
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the order.");
    }
  }

  function startEdit(order) {
    setEditingId(order._id);
    setEditError("");
    setDraft({
      items: order.items.map((i) => ({
        menuItem: String(i.menuItem),
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      fulfillmentType: order.fulfillmentType,
      deliveryAddress: order.deliveryAddress || "",
      notes: order.notes || "",
    });
  }

  function closeEditor() {
    setEditingId(null);
    setDraft(null);
    setEditError("");
  }

  function changeQty(menuItemId, delta) {
    setDraft((d) => ({
      ...d,
      items: d.items.map((i) =>
        i.menuItem === menuItemId ? { ...i, quantity: Math.min(99, Math.max(1, i.quantity + delta)) } : i
      ),
    }));
  }

  function removeItem(menuItemId) {
    setDraft((d) => ({ ...d, items: d.items.filter((i) => i.menuItem !== menuItemId) }));
  }

  function addDish(menuItemId) {
    const dish = menu.find((m) => m._id === menuItemId);
    if (!dish) return;
    setDraft((d) => {
      const existing = d.items.find((i) => i.menuItem === menuItemId);
      if (existing) {
        return {
          ...d,
          items: d.items.map((i) =>
            i.menuItem === menuItemId ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i
          ),
        };
      }
      return { ...d, items: [...d.items, { menuItem: dish._id, name: dish.name, price: dish.price, quantity: 1 }] };
    });
  }

  // Preview price: today's menu price if the dish is still listed, otherwise the saved price.
  function priceOf(item) {
    const live = menu.find((m) => m._id === item.menuItem);
    return live ? live.price : item.price;
  }

  async function saveEdit() {
    setEditError("");
    setSaving(true);
    try {
      await api.put(
        `/orders/${editingId}`,
        {
          items: draft.items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity })),
          fulfillmentType: draft.fulfillmentType,
          deliveryAddress: draft.fulfillmentType === "delivery" ? draft.deliveryAddress : "",
          notes: draft.notes,
        },
        { skipGlobalError: true }
      );
      closeEditor();
      loadOrders();
    } catch (err) {
      setEditError(
        err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Could not save your changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container page">Loading orders…</div>;

  const draftTotal = draft ? draft.items.reduce((sum, i) => sum + priceOf(i) * i.quantity, 0) : 0;

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

          {editingId === order._id && draft ? (
            <div>
              {editError && <div className="form-error">{editError}</div>}

              {draft.items.length === 0 && <p className="muted">Add at least one dish to keep this order.</p>}
              {draft.items.map((i) => (
                <div
                  key={i.menuItem}
                  style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}
                >
                  <span style={{ flex: 1, minWidth: 140 }}>
                    {i.name} <span className="muted">(${priceOf(i).toFixed(2)})</span>
                  </span>
                  <button type="button" className="btn-ghost" aria-label={`Fewer ${i.name}`} onClick={() => changeQty(i.menuItem, -1)}>
                    −
                  </button>
                  <strong>{i.quantity}</strong>
                  <button type="button" className="btn-ghost" aria-label={`More ${i.name}`} onClick={() => changeQty(i.menuItem, 1)}>
                    +
                  </button>
                  <button type="button" className="btn-ghost" aria-label={`Remove ${i.name}`} onClick={() => removeItem(i.menuItem)}>
                    Remove
                  </button>
                </div>
              ))}

              <div className="form-field">
                <label htmlFor={`add-${order._id}`}>Add a dish</label>
                <select
                  id={`add-${order._id}`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addDish(e.target.value);
                  }}
                >
                  <option value="">Choose a dish…</option>
                  {menu.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} (${m.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor={`ful-${order._id}`}>Fulfillment</label>
                <select
                  id={`ful-${order._id}`}
                  value={draft.fulfillmentType}
                  onChange={(e) => setDraft({ ...draft, fulfillmentType: e.target.value })}
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              {draft.fulfillmentType === "delivery" && (
                <div className="form-field">
                  <label htmlFor={`addr-${order._id}`}>Delivery address</label>
                  <input
                    id={`addr-${order._id}`}
                    value={draft.deliveryAddress}
                    onChange={(e) => setDraft({ ...draft, deliveryAddress: e.target.value })}
                  />
                </div>
              )}
              <div className="form-field">
                <label htmlFor={`notes-${order._id}`}>Notes (optional)</label>
                <textarea
                  id={`notes-${order._id}`}
                  rows={2}
                  maxLength={300}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <strong>New total: ${draftTotal.toFixed(2)}</strong>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="btn btn-primary" disabled={saving || draft.items.length === 0} onClick={saveEdit}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button type="button" className="btn-ghost" onClick={closeEditor}>
                    Discard
                  </button>
                </div>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>
                The final price is confirmed by the restaurant at today&apos;s menu prices.
              </p>
            </div>
          ) : (
            <>
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
              {order.notes && <p className="muted">Notes: {order.notes}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <strong>Total: ${order.totalPrice.toFixed(2)}</strong>
                {order.status === "pending" && (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn-ghost" onClick={() => startEdit(order)}>
                      Edit order
                    </button>
                    <button className="btn btn-danger" onClick={() => handleCancel(order._id)}>
                      Cancel order
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
