import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api.js";

export default function Checkout() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
        notes,
      });
      setConfirmedOrder(data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <div className="container page">
        <div className="form-success" style={{ maxWidth: 480 }}>
          Order confirmed! Your {confirmedOrder.fulfillmentType} order totals $
          {confirmedOrder.totalPrice.toFixed(2)}.
        </div>
        <Link to="/orders" className="btn btn-primary">
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h2>Your cart</h2>
      <div className="grid-2">
        <div className="cart-panel">
          {items.length === 0 && (
            <div className="empty-state">
              Your cart is empty. <Link to="/menu">Browse the menu</Link>
            </div>
          )}
          {items.map((i) => (
            <div key={i.menuItem._id} className="cart-line">
              <div>
                <strong>{i.menuItem.name}</strong>
                <div className="muted">${i.menuItem.price.toFixed(2)} each</div>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQuantity(i.menuItem._id, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQuantity(i.menuItem._id, i.quantity + 1)}>+</button>
              </div>
              <button className="btn-ghost" onClick={() => removeItem(i.menuItem._id)}>
                Remove
              </button>
            </div>
          ))}
          {items.length > 0 && (
            <div className="cart-total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <form className="form-card" style={{ maxWidth: "none" }} onSubmit={handlePlaceOrder}>
            <h3>Delivery details</h3>
            {error && <div className="form-error">{error}</div>}
            <div className="form-field">
              <label>Fulfillment</label>
              <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)}>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            {fulfillmentType === "delivery" && (
              <div className="form-field">
                <label htmlFor="address">Delivery address</label>
                <input
                  id="address"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}
            <div className="form-field">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <p className="muted">Payment is simulated for this demo — no card details needed.</p>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Placing order…" : `Place order — $${totalPrice.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}