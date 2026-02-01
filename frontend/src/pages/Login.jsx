import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function Login() {
  const { user, loading, login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("org@example.com");
  const [password, setPassword] = useState("password123");
  const [msg, setMsg] = useState("");

  // ✅ Редирект ТОЛЬКО после того, как auth догрузился
  useEffect(() => {
    if (!loading && user) nav("/", { replace: true });
  }, [loading, user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e2) {
      setMsg(e2.message);
    }
  }

  // Пока грузится — не делаем лишних редиректов/миганий
  if (loading) {
    return (
      <div className="container narrow">
        <div className="muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h1 className="h1">Login</h1>

      <form className="panel" onSubmit={onSubmit}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn" type="submit">Sign in</button>
      </form>

      <Toast message={msg} onClose={() => setMsg("")} />
    </div>
  );
}
