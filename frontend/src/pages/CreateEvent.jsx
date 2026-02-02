import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventsAPI } from "../api/events";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function CreateEvent() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "Almaty",
    place: "",
    startAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString().slice(0, 16),
    capacity: 50,
    tags: "mongodb,react",
  });

  const [schedule, setSchedule] = useState([{ title: "", time: "" }]);

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return (
      <div className="container">
        <div className="muted">Organizer only.</div>
      </div>
    );
  }

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function addScheduleRow() {
    setSchedule((prev) => [...prev, { title: "", time: "" }]);
  }

  function removeScheduleRow(idx) {
    setSchedule((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateScheduleRow(idx, key, value) {
    setSchedule((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const normalizedSchedule = (schedule || [])
        .filter((x) => (x.title || "").trim() && x.time)
        .map((x) => ({
          title: x.title.trim(),
          time: new Date(x.time).toISOString(),
        }));

      const payload = {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        capacity: Number(form.capacity),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        schedule: normalizedSchedule, // ✅ instead of []
      };

      const data = await EventsAPI.create(payload);
      setMsg("Created (draft) ✅");
      nav(`/events/${data.event._id}`);
    } catch (e2) {
      setMsg(e2.message);
    }
  }

  return (
    <div className="container narrow">
      <h1 className="h1">Create event</h1>
      <form className="panel" onSubmit={submit}>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />

        <label className="label">Description</label>
        <textarea className="input" rows="4" value={form.description} onChange={(e) => set("description", e.target.value)} />

        <label className="label">City</label>
        <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />

        <label className="label">Place</label>
        <input className="input" value={form.place} onChange={(e) => set("place", e.target.value)} />

        <div className="row gap">
          <div className="col">
            <label className="label">Start</label>
            <input className="input" type="datetime-local" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
          </div>
          <div className="col">
            <label className="label">End</label>
            <input className="input" type="datetime-local" value={form.endAt} onChange={(e) => set("endAt", e.target.value)} />
          </div>
        </div>

        <div className="row gap">
          <div className="col">
            <label className="label">Capacity</label>
            <input className="input" type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </div>
          <div className="col">
            <label className="label">Tags (comma)</label>
            <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>
        </div>

        <label className="label" style={{ marginTop: 10 }}>Schedule</label>

        <div className="panel" style={{ marginTop: 8 }}>
          {(schedule || []).map((row, idx) => (
            <div key={idx} className="row gap" style={{ flexWrap: "wrap", marginBottom: 10 }}>
              <input
                className="input"
                placeholder={`Item #${idx + 1} title`}
                value={row.title}
                onChange={(e) => updateScheduleRow(idx, "title", e.target.value)}
                style={{ minWidth: 220, flex: 1 }}
              />
              <input
                className="input"
                type="datetime-local"
                value={row.time}
                onChange={(e) => updateScheduleRow(idx, "time", e.target.value)}
                style={{ minWidth: 220 }}
              />
              <button
                type="button"
                className="btn btnGhost"
                onClick={() => removeScheduleRow(idx)}
                disabled={schedule.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="btn" onClick={addScheduleRow}>
            + Add schedule item
          </button>
        </div>

        <button className="btn" type="submit" style={{ marginTop: 12 }}>
          Create
        </button>
      </form>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
