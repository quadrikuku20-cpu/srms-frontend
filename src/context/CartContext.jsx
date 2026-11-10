import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_KEY = "srms_cart";

// Read the saved cart; fall back to an empty cart if storage is empty or corrupted.
function loadSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadSavedCart); // [{ menuItem: {..}, quantity }]

  // Save the cart whenever it changes so a refresh does not lose it.
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked - the cart still works for this session
    }
  }, [items]);

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem._id === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem._id !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItem._id === menuItemId ? { ...i, quantity } : i))
    );
  }

  function removeItem(menuItemId) {
    setItems((prev) => prev.filter((i) => i.menuItem._id !== menuItemId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
    [items]
  );

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, totalPrice, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
