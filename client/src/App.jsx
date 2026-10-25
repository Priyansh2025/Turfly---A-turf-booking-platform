import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <a href="/" className="logo">
          Turfly<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#turfs">Explore Turfs</a>
          <a href="#about">About Us</a>
        </div>

        <div className="nav-actions">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
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
                />
              </div>

              <div className="search-field">
                <label htmlFor="sport">SPORT</label>
                <select id="sport" defaultValue="Football">
                  <option>Football</option>
                  <option>Cricket</option>
                  <option>Badminton</option>
                  <option>Basketball</option>
                </select>
              </div>

              <button
                className="search-btn"
                onClick={() => alert("Turf search is coming soon!")}
              >
                Find Turfs →
              </button>
            </div>

            <p className="hero-note">
              Made for players. Built for the love of the game.
            </p>
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

export default App;
