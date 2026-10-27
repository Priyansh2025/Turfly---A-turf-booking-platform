import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import { useState } from "react";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchSport, setSearchSport] = useState("Football");

  async function handleLogout() {
    setShowLogoutConfirm(false);

    try {
      await logout();
      navigate("/login");
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }
  function handleSearch() {
    const params = new URLSearchParams();

    if (searchLocation.trim()) {
      params.set("location", searchLocation.trim());
    }

    params.set("sport", searchSport);

    navigate(`/turfs?${params.toString()}`);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          Turfly<span>.</span>
        </Link>

        <div className="nav-links">
          <Link to="/turfs">Explore Turfs</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </div>

        <div className="nav-actions">
          <span className="welcome-user">Hi, {user?.name}</span>

          <button
            className="login-btn"
            onClick={() => {
              setLogoutError("");
              setShowLogoutConfirm(true);
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="dashboard-layout">
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">YOUR TURFLY ACCOUNT</p>

            <h1>
              Welcome back,
              <br />
              <span>{user?.name || "Player"}!</span>
            </h1>

            <p className="hero-description">
              Your next game starts here. Get ready to find and book your
              perfect turf.
            </p>

            <div className="dashboard-actions">
              <Link to="/turfs" className="signup-btn">
                Explore Turfs
              </Link>
              <Link to="/my-bookings" className="signup-btn">
                My Bookings
              </Link>
            </div>
          </div>
        </section>
        <section className="turf-discovery">
          <div className="turf-discovery-header">
            <p className="eyebrow">FIND YOUR GAME</p>
            <h2>Discover turfs near you</h2>
            <p>Find the perfect ground for your next match.</p>
          </div>

          <div className="turf-search">
            <input
              type="text"
              placeholder="Enter your area or location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <select
              value={searchSport}
              onChange={(e) => setSearchSport(e.target.value)}
            >
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Badminton">Badminton</option>
            </select>

            <button type="button" className="signup-btn" onClick={handleSearch}>
              Search Turfs
            </button>
          </div>
        </section>
      </main>
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h2>Log out?</h2>
            <p>Are you sure you want to log out of your Turfly account?</p>

            {logoutError && (
              <p className="auth-message auth-error" role="alert">
                {logoutError}
              </p>
            )}

            <div className="logout-actions">
              <button
                className="login-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button className="signup-btn" onClick={handleLogout}>
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
