import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
async function api(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

function fmtDateRange(startISO, endISO) {
  try {
    const s = new Date(startISO);
    const e = endISO ? new Date(endISO) : null;
    const pad = (n) => String(n).padStart(2, "0");
    const d = `${pad(s.getDate())}.${pad(s.getMonth() + 1)}.${s.getFullYear()}`;
    const st = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    if (!e) return `${d}, ${st}`;
    const et = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
    return `${d}, ${st} → ${et}`;
  } catch {
    return startISO;
  }
}

export default function Events() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("any"); // any | published | draft
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await api("/api/events?limit=200");
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e) {
      setErr(e?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const cc = city.trim().toLowerCase();

    return events.filter((ev) => {
      const title = (ev.title || "").toLowerCase();
      const desc = (ev.description || "").toLowerCase();
      const evCity = (ev.city || "").toLowerCase();
      const tags = Array.isArray(ev.tags) ? ev.tags.join(" ").toLowerCase() : "";

      const okQ = !qq || title.includes(qq) || desc.includes(qq) || evCity.includes(qq) || tags.includes(qq);
      const okCity = !cc || evCity.includes(cc);
      const okStatus = status === "any" ? true : (ev.status || "").toLowerCase() === status;

      return okQ && okCity && okStatus;
    });
  }, [events, q, city, status]);

  async function seedDemo() {
    setErr("");
    try {
      await api("/api/dev/seed-demo", { method: "POST" });
      await load();
    } catch (e) {
      setErr(`Seed failed: ${e?.message || "Unknown error"}`);
    }
  }

  return (
    <div className="container">
      <div className="row space">
        <div>
          <h1 className="h1">Events</h1>
          <div className="muted">
            API: <span style={{ opacity: 0.9 }}>{API}</span>
            {user ? (
              <> · Signed in as <b>{user.email}</b> (<b>{user.role}</b>)</>
            ) : (
              <> · Not signed in (still can view list)</>
            )}
          </div>
        </div>

        <div className="row gap">
          <button className="btn btnGhost" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button className="btn" onClick={seedDemo}>
            Seed demo events
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="row gap" style={{ flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Search title / desc / tags..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 240, flex: 1 }}
          />
          <input
            className="input"
            placeholder="City filter (e.g., Almaty)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ minWidth: 200 }}
          />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="any">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {err ? (
          <div style={{ marginTop: 12 }} className="pill">
            <span className="dot" style={{ background: "#ff5a5a" }} />
            <b>Error:</b>&nbsp;{err}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div className="panel"><div className="muted">Loading events…</div></div>
        ) : filtered.length === 0 ? (
          <div className="panel">
            <b>No events yet.</b>
            <div className="muted" style={{ marginTop: 6 }}>
              Нажми <b>Seed demo events</b> или создай событие через <b>Create</b> (если ты organizer).
            </div>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((ev) => (
              <div key={ev._id} className="card">
                <div className="row space" style={{ alignItems: "flex-start" }}>
                  <div>
                    <div className="cardTitle">{ev.title || "(no title)"}</div>
                    <div className="muted">
                      {(ev.city || "Unknown city")} · {fmtDateRange(ev.startAt || ev.startsAt, ev.endAt || ev.endsAt)}
                    </div>
                  </div>

                  <span className="badge">
                    {(ev.status || "unknown").toUpperCase()}
                  </span>
                </div>

                <div className="muted" style={{ marginTop: 10, minHeight: 40 }}>
                  {(ev.description || "").slice(0, 120) || "No description"}
                  {(ev.description || "").length > 120 ? "…" : ""}
                </div>

                <div className="row gap" style={{ marginTop: 10, flexWrap: "wrap" }}>
                  {(ev.tags || []).slice(0, 6).map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                  <span className="chip">cap {ev.capacity ?? "—"}</span>
                  <span className="chip">views {ev?.counters?.views ?? 0}</span>
                </div>

                <div className="row space" style={{ marginTop: 12 }}>
                  <Link className="btn btnGhost" to={`/events/${ev._id}`}>
                    Open
                  </Link>

                  {user?.role === "organizer" || user?.role === "admin" ? (
                    <span className="muted">You can manage in Dashboard</span>
                  ) : (
                    <span className="muted">Register inside event</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
