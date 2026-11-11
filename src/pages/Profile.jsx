import { useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const DIETARY = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [favoriteCategory, setFavoriteCategory] = useState(user.preferences?.favoriteCategory || "");
  const [dietary, setDietary] = useState(user.preferences?.dietaryRestrictions || []);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleDietary(value) {
    setDietary((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const { data } = await api.put(
        `/users/${user.id}`,
        { name, preferences: { favoriteCategory: favoriteCategory || null, dietaryRestrictions: dietary } },
        { skipGlobalError: true }
      );
      updateUser({ name: data.name, preferences: data.preferences });
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <h2>My profile</h2>
      <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-field">
          <label htmlFor="pname">Name</label>
          <input id="pname" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="pemail">Email</label>
          <input id="pemail" value={user.email} disabled />
        </div>

        <div className="form-field">
          <label htmlFor="pcat">Favorite category</label>
          <select id="pcat" value={favoriteCategory} onChange={(e) => setFavoriteCategory(e.target.value)}>
            <option value="">No preference</option>
            <option value="starter">Starters</option>
            <option value="main">Mains</option>
            <option value="dessert">Desserts</option>
            <option value="beverage">Beverages</option>
          </select>
        </div>

        <div className="form-field">
          <label>Dietary needs</label>
          {DIETARY.map((d) => (
            <label key={d.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={dietary.includes(d.value)}
                onChange={() => toggleDietary(d.value)}
              />
              {d.label}
            </label>
          ))}
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
