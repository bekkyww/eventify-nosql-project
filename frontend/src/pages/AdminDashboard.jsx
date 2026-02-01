import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/Card";
import Toast from "../components/Toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const d = await api("/api/admin/stats");
      setData(d);
    } catch (e) {
      setMsg(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (!user || user.role !== "admin") {
    return <div className="container"><div className="muted">Admin only.</div></div>;
  }

  if (!data) return <div className="container"><div className="muted">Loading...</div></div>;

  return (
    <div className="container">
      <h1 className="h1">Admin stats</h1>

      <div className="grid2">
        <Card title="Totals">
          <div className="kv"><span>Events</span><b>{data.totals.events}</b></div>
          <div className="kv"><span>Tickets</span><b>{data.totals.tickets}</b></div>
          <div className="kv"><span>Checkins</span><b>{data.totals.checkins}</b></div>
          <div className="kv"><span>Feedbacks</span><b>{data.totals.feedbacks}</b></div>
        </Card>

        <Card title="Top cities">
          {(data.topCities || []).map((c) => (
            <div className="kv" key={c._id}><span>{c._id}</span><b>{c.events}</b></div>
          ))}
        </Card>
      </div>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
