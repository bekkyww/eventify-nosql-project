import { useEffect, useState } from "react";
import { EventsAPI } from "../api/events";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/Card";
import Toast from "../components/Toast";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const data = await EventsAPI.list({ status: "draft" });
      setEvents(data.events);
    } catch (e) {
      setMsg(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return <div className="container"><div className="muted">Organizer only.</div></div>;
  }

  async function publish(id) {
    try {
      await EventsAPI.publish(id);
      setMsg("Published ✅");
      load();
    } catch (e) { setMsg(e.message); }
  }

  async function close(id) {
    try {
      await EventsAPI.close(id);
      setMsg("Closed ✅");
      load();
    } catch (e) { setMsg(e.message); }
  }

  async function stats(id) {
    try {
      const s = await EventsAPI.stats(id);
      setMsg(`Stats: reg=${s.registered}, checkins=${s.checkedIn}, conv=${(s.conversion*100).toFixed(0)}%`);
    } catch (e) { setMsg(e.message); }
  }

  return (
    <div className="container">
      <h1 className="h1">Organizer dashboard</h1>
      <p className="muted">Publish/close events and view aggregation stats.</p>

      <div className="grid">
        {events.map(ev => (
          <Card
            key={ev._id}
            title={ev.title}
            subtitle={`${ev.city} · ${new Date(ev.startAt).toLocaleString()}`}
            right={<span className={`badge badge-${ev.status}`}>{ev.status}</span>}
          >
            <div className="row gap">
              <button className="btn btnSmall" onClick={() => publish(ev._id)}>Publish</button>
              <button className="btn btnSmall btnGhost" onClick={() => close(ev._id)}>Close</button>
              <button className="btn btnSmall btnGhost" onClick={() => stats(ev._id)}>Stats</button>
            </div>
          </Card>
        ))}
      </div>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
