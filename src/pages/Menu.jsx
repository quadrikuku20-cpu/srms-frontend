import { useEffect, useMemo, useState } from "react";
import api from "../api/api.js";
import MenuItemCard from "../components/MenuItemCard.jsx";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "starter", label: "Starters" },
  { value: "main", label: "Mains" },
  { value: "dessert", label: "Desserts" },
  { value: "beverage", label: "Beverages" },
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [dietary, setDietary] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (dietary) params.dietary = dietary;
    if (search) params.search = search;

    api
      .get("/menu", { params })
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, dietary, search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const item of items) {
      groups[item.category] = groups[item.category] || [];
      groups[item.category].push(item);
    }
    return groups;
  }, [items]);

  return (
    <div className="container page">
      <h2>Menu</h2>
      <div className="menu-toolbar">
        <div className="category-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={category === c.value ? "active" : ""}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
          <option value="">Any diet</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="dairy-free">Dairy-free</option>
          <option value="nut-free">Nut-free</option>
        </select>
      </div>

      {loading && <p>Loading menu…</p>}
      {!loading && items.length === 0 && (
        <div className="empty-state">No dishes match those filters.</div>
      )}

      {!loading &&
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} style={{ marginBottom: 36 }}>
            {!category && <h3 style={{ textTransform: "capitalize" }}>{cat}s</h3>}
            <div className="menu-grid">
              {catItems.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}