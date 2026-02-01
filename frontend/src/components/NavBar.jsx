import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="nav">
      <Link className="brand" to="/">Eventify</Link>

      <div className="navLinks">
        <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Events</NavLink>

        {user?.role === "organizer" ? (
          <>
            <NavLink to="/create" className={({isActive}) => isActive ? "active" : ""}>Create</NavLink>
            <NavLink to="/organizer" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
          </>
        ) : null}

        {user?.role === "admin" ? (
          <NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>Admin</NavLink>
        ) : null}
      </div>

      <div className="navRight">
        {user ? (
          <>
            <div className="pill">
              <span className="dot" />
              {user.name} · <b>{user.role}</b>
            </div>
            <button className="btn btnGhost" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn btnGhost" to="/login">Login</Link>
            <Link className="btn" to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
