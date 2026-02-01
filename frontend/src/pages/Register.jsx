import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function Register() {
  const { user, loading, register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("attendee");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!loading && user) nav("/", { replace: true });
  }, [loading, user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      nav("/", { replace: true });
    } catch (e2) {
      setMsg(e2.message);
    }
  }

  if (loading) {
    return (
      <div className="container narrow">
        <div className="muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h1 className="h1">Register</h1>

      <form className="panel" onSubmit={onSubmit}>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="label">Role</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>

        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn" type="submit">Create account</button>
      </form>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
