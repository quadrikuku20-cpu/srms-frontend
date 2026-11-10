import { useEffect, useState } from "react";
import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  function loadUsers() {
    api
      .get("/users")
      .then(({ data }) => {
        setUsers(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load users."));
  }

  useEffect(loadUsers, []);

  async function handleDelete(u) {
    if (!window.confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the user.");
    }
  }

  return (
    <div>
      <h3>Users</h3>
      {error && <div className="form-error">{error}</div>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td style={{ textTransform: "capitalize" }}>{u.role}</td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
              <td>
                {u._id !== me?.id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
