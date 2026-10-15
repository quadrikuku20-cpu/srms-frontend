import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="brand">
            <span className="brand-mark">Dunbi</span> &amp; Temi
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/menu">Menu</NavLink>
          {user && <NavLink to="/reservations">Reservations</NavLink>}
          {user && <NavLink to="/events">Events</NavLink>}
          {user && <NavLink to="/orders">My Orders</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/checkout">
            Cart{totalCount > 0 && <span className="cart-pill">{totalCount}</span>}
          </NavLink>
          {user ? (
            <button className="link-btn" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}