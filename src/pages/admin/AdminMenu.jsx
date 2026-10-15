import { useEffect, useState } from "react";
import api from "../../api/api.js";

const emptyForm = {
  name: "",
  category: "main",
  price: "",
  description: "",
  ingredients: "",
  dietaryInfo: "",
  isAvailable: true,
};

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function loadItems() {
    api.get("/menu", { params: { includeUnavailable: true } }).then(({ data }) => setItems(data));
  }

  useEffect(loadItems, []);

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      ingredients: (item.ingredients || []).join(", "),
      dietaryInfo: (item.dietaryInfo || []).join(", "),
      isAvailable: item.isAvailable,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      dietaryInfo: form.dietaryInfo.split(",").map((s) => s.trim()).filter(Boolean),
      isAvailable: form.isAvailable,
    };
    try {
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
      } else {
        await api.post("/menu", payload);
      }
      resetForm();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save menu item.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this menu item?")) return;
    await api.delete(`/menu/${id}`);
    loadItems();
  }

  return (
    <div className="grid-2">
      <div>
        <h3>Menu items</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.isAvailable ? "Yes" : "No"}</td>
                <td>
                  <button className="btn-ghost" onClick={() => startEdit(item)}>
                    Edit
                  </button>{" "}
                  <button className="btn-ghost" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="form-card" style={{ maxWidth: "none" }} onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit item" : "Add menu item"}</h3>
        {error && <div className="form-error">{error}</div>}
        <div className="form-field">
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="starter">Starter</option>
              <option value="main">Main</option>
              <option value="dessert">Dessert</option>
              <option value="beverage">Beverage</option>
            </select>
          </div>
          <div className="form-field">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>Ingredients (comma-separated)</label>
          <input
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>Dietary info (comma-separated: vegetarian, vegan, gluten-free…)</label>
          <input
            value={form.dietaryInfo}
            onChange={(e) => setForm({ ...form, dietaryInfo: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>
            <input
              type="checkbox"
              style={{ width: "auto", marginRight: 8 }}
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
            />
            Available
          </label>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" type="submit">
            {editingId ? "Save changes" : "Add item"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}