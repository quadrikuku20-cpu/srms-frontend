import { useCart } from "../context/CartContext.jsx";

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();

  return (
    <div className="menu-item">
      <div className="menu-item-top">
        <h3>{item.name}</h3>
        <span className="menu-item-price">${item.price.toFixed(2)}</span>
      </div>
      <p className="menu-item-desc">{item.description}</p>
      <div className="tag-row">
        {item.dietaryInfo?.map((d) => (
          <span key={d} className="tag">
            {d}
          </span>
        ))}
        {!item.isAvailable && <span className="tag unavailable">unavailable</span>}
        {item.isPopular && <span className="tag">popular</span>}
      </div>
      <div className="menu-item-actions">
        <button
          className="btn btn-secondary btn-sm"
          disabled={!item.isAvailable}
          onClick={() => addItem(item)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}