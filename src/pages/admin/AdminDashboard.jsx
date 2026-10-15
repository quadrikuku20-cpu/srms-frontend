import { useState } from "react";
import AdminMenu from "./AdminMenu.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminReservations from "./AdminReservations.jsx";

const TABS = [
  { key: "menu", label: "Menu" },
  { key: "orders", label: "Orders" },
  { key: "reservations", label: "Reservations & Events" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("menu");

  return (
    <div className="container page">
      <h2>Admin dashboard</h2>
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "menu" && <AdminMenu />}
      {tab === "orders" && <AdminOrders />}
      {tab === "reservations" && <AdminReservations />}
    </div>
  );
}