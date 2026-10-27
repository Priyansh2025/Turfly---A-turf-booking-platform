import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Turfs() {
  const [turfs, setTurfs] = useState([]);

  const [searchParams] = useSearchParams();

  const [searchLocation, setSearchLocation] = useState(
    searchParams.get("location") || "",
  );

  const [selectedSport, setSelectedSport] = useState(
    searchParams.get("sport") || "All",
  );

  const filteredTurfs = turfs.filter((turf) => {
    const matchesLocation = turf.location
      .toLowerCase()
      .includes(searchLocation.toLowerCase());

    const matchesSport =
      selectedSport === "All" || turf.sport === selectedSport;

    return matchesLocation && matchesSport;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTurfs() {
      try {
        const response = await axios.get("/api/turfs");
        setTurfs(response.data.turfs);
      } catch (err) {
        setError("Unable to load turfs. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTurfs();
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          Turfly<span>.</span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main>
        <section className="turf-discovery">
          <div className="turf-discovery-header">
            <p className="eyebrow">FIND YOUR GAME</p>
            <h2>Explore Turfs</h2>
            <p>Discover the perfect ground for your next game.</p>
          </div>

          {loading && <p>Loading turfs...</p>}

          {error && <p className="auth-error">{error}</p>}

          {!loading && !error && turfs.length === 0 && (
            <p>No turfs available yet.</p>
          )}
          <div className="turf-search-controls">
            <input
              type="text"
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />

            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              <option value="All">All Sports</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Badminton">Badminton</option>
            </select>
          </div>

          <div className="turf-grid">
            {filteredTurfs.map((turf) => (
              <div className="turf-card" key={turf._id}>
                <div
                  className="turf-card-image"
                  style={
                    turf.image
                      ? {
                          backgroundImage: `url("${turf.image}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  <span>{turf.sport}</span>
                </div>

                <div className="turf-card-content">
                  <h3>{turf.name}</h3>
                  <p className="turf-location">{turf.location}</p>

                  <div className="turf-card-footer">
                    <p>
                      <strong>₹{turf.pricePerHour}</strong>
                      <span> / hour</span>
                    </p>

                    <Link to={`/turfs/${turf._id}`} className="signup-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Turfs;
