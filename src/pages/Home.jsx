import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-eyebrow">Seasonal menu, every table</div>
        <h1>Good food, easy to book, easy to order.</h1>
        <p className="lede">
          Browse the menu, reserve a table, or send an order for pickup or delivery —
          all from one place. Our assistant is on hand if you have questions about
          specials or dietary needs.
        </p>
        <div className="hero-actions">
          <Link to="/menu" className="btn btn-primary">
            View the menu
          </Link>
          <Link to="/reservations" className="btn btn-secondary">
            Book a table
          </Link>
        </div>
      </div>
    </div>
  );
}