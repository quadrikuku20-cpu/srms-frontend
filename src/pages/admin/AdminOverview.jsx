import { useEffect, useState } from "react";
import api from "../../api/api.js";

const card = { border: "1px solid var(--line)", background: "#fff", padding: 18 };

function Stat({ label, value }) {
  return (
    <div style={card}>
      <div className="muted">{label}</div>
      <div style={{ fontFamily: '"Fraunces", serif', fontSize: "1.7rem", color: "var(--wine)" }}>{value}</div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  function loadStats() {
    api
      .get("/stats", { skipGlobalError: true })
      .then(({ data }) => {
        setStats(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load the overview."));
  }

  // Load once, then refresh every 30 seconds while the tab is visible.
  useEffect(() => {
    loadStats();
    const timer = setInterval(() => {
      if (!document.hidden) loadStats();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!stats) return <p className="muted">Loading overview…</p>;

  const maxOrders = Math.max(1, ...stats.perDay.map((d) => d.orders));
  const maxQty = Math.max(1, ...stats.topItems.map((t) => t.quantity));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        <Stat label="Revenue (excl. cancelled)" value={`$${stats.revenue.toFixed(2)}`} />
        <Stat label="Orders" value={stats.orders} />
        <Stat label="Avg order value" value={`$${stats.avgOrderValue.toFixed(2)}`} />
        <Stat label="Pending orders" value={stats.ordersByStatus.pending || 0} />
        <Stat label="Upcoming reservations" value={stats.upcomingReservations} />
        <Stat label="Pending event requests" value={stats.pendingEvents} />
        <Stat label="Customers" value={stats.customers} />
      </div>

      <div style={{ ...card, marginBottom: 28 }}>
        <h3 style={{ marginTop: 0 }}>Orders per day (last 7 days)</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
          {stats.perDay.map((d) => (
            <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
              <div className="muted">{d.orders}</div>
              <div
                title={`${d.orders} orders, $${d.revenue.toFixed(2)}`}
                style={{
                  height: Math.max(3, (d.orders / maxOrders) * 100),
                  background: "var(--wine)",
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {stats.perDay.map((d) => (
            <div key={d.date} className="muted" style={{ flex: 1, textAlign: "center", fontSize: "0.72rem" }}>
              {d.date.slice(5)}
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Top dishes</h3>
        {stats.topItems.length === 0 && <p className="muted">No orders yet.</p>}
        {stats.topItems.map((t) => (
          <div key={t.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span>{t.name}</span>
              <span className="muted">
                {t.quantity} sold · ${t.revenue.toFixed(2)}
              </span>
            </div>
            <div style={{ background: "var(--cream-deep)", height: 8, borderRadius: 4, marginTop: 4 }}>
              <div style={{ width: `${(t.quantity / maxQty) * 100}%`, height: 8, background: "var(--gold)", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
