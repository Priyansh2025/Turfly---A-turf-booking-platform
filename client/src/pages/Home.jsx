import "../App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Home() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState("Checking backend...");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSport, setSelectedSport] = useState("Football");

  useEffect(() => {
    axios
      .get("/api/health")
      .then((response) => {
        setApiStatus(response.data.message);
      })
      .catch(() => {
        setApiStatus("Backend unavailable");
      });
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();

    if (searchLocation.trim()) {
      params.set("location", searchLocation.trim());
    }

    params.set("sport", selectedSport);

    navigate(`/turfs?${params.toString()}`);
  }
  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          Turfly<span>.</span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="nav-actions">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span className="welcome-user">Hi, {user.name}</span>

              <button
                className="login-btn"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Log In
              </Link>

              <Link to="/register" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR GAME. YOUR GROUND.</p>

            <h1>
              Find your ground.
              <br />
              <span>Own your game.</span>
            </h1>

            <p className="hero-description">
              Discover the best sports turfs around you and book your next match
              in just a few clicks.
            </p>

            <div className="search-box">
              <div className="search-field">
                <label htmlFor="location">LOCATION</label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter your city or area"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
              </div>

              <div className="search-field">
                <label htmlFor="sport">SPORT</label>
                <select
                  id="sport"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>

              <button className="search-btn" onClick={handleSearch}>
                Find Turfs →
              </button>
            </div>

            <p className="hero-note">
              Made for players. Built for the love of the game.
            </p>
            <p className="hero-note">Backend status: {apiStatus}</p>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>

            <div className="football">⚽</div>

            <div className="visual-card">
              <span className="live-dot"></span>
              YOUR NEXT MATCH STARTS HERE
            </div>
          </div>
        </section>

        <section className="features" id="about">
          <div className="feature">
            <span className="feature-icon">📍</span>
            <div>
              <h3>Find Nearby Turfs</h3>
              <p>Discover grounds around your location.</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">📅</span>
            <div>
              <h3>Easy Booking</h3>
              <p>Spend less time planning and more time playing.</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">🏆</span>
            <div>
              <h3>Play Your Sport</h3>
              <p>Find a ground for your next game.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
