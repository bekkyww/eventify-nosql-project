import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventsAPI } from "../api/events";
import { TicketsAPI } from "../api/tickets";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/Card";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";
export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState({ avg: null, count: 0 });
  const [msg, setMsg] = useState("");

  const [fbRating, setFbRating] = useState(5); // number
  const [fbText, setFbText] = useState("");
  const [comments, setComments] = useState([]);

  async function load() {
    try {
      const data = await EventsAPI.get(id);
      setEvent(data.event);
      setRating(data.rating || { avg: null, count: 0 });
    } catch (e) {
      setMsg(e?.message || "Failed to load event");
    }
  }

  async function loadComments() {
    if (!id) return;
    try {
      const res = await EventsAPI.getFeedback(id);
      const list = res.feedback || res.comments || res.items || [];
      setComments(Array.isArray(list) ? list : []);
    } catch (e) {
      setComments([]);
    }
  }

  useEffect(() => {
    load();
    loadComments();
  }, [id]);

  async function register() {
    try {
      await TicketsAPI.register(id);
      setMsg("Registered ✅");
      await load(); 
      await loadComments();
    } catch (e) {
      setMsg(e?.message || "Register failed");
    }
  }

  async function cancel() {
    try {
      await TicketsAPI.cancel(id);
      setMsg("Cancelled ✅");
      await load();
      await loadComments();
    } catch (e) {
      setMsg(e?.message || "Cancel failed");
    }
  }

  async function feedback() {
    try {
      await TicketsAPI.feedback(id, { rating: Number(fbRating), text: fbText });
      setMsg("Feedback saved ✅");
      setFbText("");
      await load();        
      await loadComments(); 
    } catch (e) {
      setMsg(e?.message || "Feedback failed");
    }
  }
  async function deleteEvent() {
  if (!window.confirm("Delete this event?")) return;

  try {
    await EventsAPI.delete(id);
    setMsg("Deleted ✅");
    navigate("/");
  } catch (e) {
    setMsg(e.message);
  }
}

  if (!event) {
    return (
      <div className="container">
        <div className="muted">Loading...</div>
      </div>
    );
  }

  const ratingSubtitle =
    rating?.count
      ? `Rating: ${(Number(rating.avg) || 0).toFixed(2)} (${rating.count})`
      : "No ratings yet";
  const canDelete =
  user &&
  (user.role === "admin" ||
    (user.role === "organizer" &&
      String(event.ownerId) === String(user._id)));

  return (
    <div className="container">
      <div className="row between">
        <div>
          <h1 className="h1">{event.title}</h1>
          <div className="muted">
            {event.city} · {new Date(event.startAt).toLocaleString()} →{" "}
            {new Date(event.endAt).toLocaleTimeString()}
          </div>
          <div className="row gap">
            <span className={`badge badge-${event.status}`}>{event.status}</span>
            <span className="badge badge-soft">capacity {event.capacity}</span>
            <span className="badge badge-soft">views {event.counters?.views ?? 0}</span>
          </div>
        </div>

        {user ? (
  <div className="row gap">
    <button className="btn" onClick={register}>Register</button>
    <button className="btn btnGhost" onClick={cancel}>Cancel</button>

    {canDelete && (
      <button className="btn btnDanger" onClick={deleteEvent}>
        Delete
      </button>
    )}
  </div>
) : (
  <div className="muted">Login to register</div>
)}
      </div>

      <div className="grid2">
        <Card title="About" subtitle={ratingSubtitle}>
          <div>{event.description || "—"}</div>
          <div className="spacer" />
          <div className="muted">Place: {event.place || "—"}</div>
          <div className="muted">Tags: {event.tags?.join(", ") || "—"}</div>
        </Card>

        <Card title="Schedule" subtitle="embedded array">
          {(event.schedule || []).length ? (
            <ul className="list">
              {event.schedule.map((s, idx) => (
                <li key={idx} className="listItem">
                  <span>{s.title}</span>
                  <span className="muted">{new Date(s.time).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="muted">No schedule</div>
          )}
        </Card>
      </div>

      {user ? (
        <Card title="Leave feedback" subtitle="Allowed after check-in">
          <div className="row gap">
            <select
              className="input"
              value={fbRating}
              onChange={(e) => setFbRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((v) => (
                <option key={v} value={v}>
                  {v} stars
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Short comment..."
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
            />

            <button className="btn" onClick={feedback} disabled={!fbText.trim()}>
              Send
            </button>
          </div>
        </Card>
      ) : null}

      <Card title="Comments">
        {comments.length === 0 ? (
          <div className="muted">No comments yet</div>
        ) : (
          <ul className="list">
            {comments.map((c) => {
              const who = c.userName || c.userEmail || "Anonymous";
              const text = c.text || c.comment || c.message || "";
              const created = c.createdAt ? new Date(c.createdAt).toLocaleString() : "";
              return (
                <li key={c._id || `${who}-${created}-${text}`} className="listItem">
                  <div className="row between">
                    <span>
                      <b>{who}</b> · {Number(c.rating || 0)}★
                    </span>
                    <span className="muted">{created}</span>
                  </div>
                  <div className="muted">{text}</div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
