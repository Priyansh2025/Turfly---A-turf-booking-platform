import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  async function fetchBookings() {
    try {
      const response = await axios.get("/api/bookings/my");
      setBookings(response.data.bookings || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your bookings. Please log in again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleCancel(booking) {
    // Prevent multiple cancellation requests from this page.
    if (cancellingId) return;

    const isPaid =
      booking.status === "Confirmed" && booking.paymentStatus === "Paid";

    const confirmationMessage = isPaid
      ? "Are you sure you want to cancel this confirmed booking and request a refund through Razorpay?"
      : "Are you sure you want to cancel this pending booking and release the time slot?";

    if (!window.confirm(confirmationMessage)) return;

    setCancellingId(booking._id);
    setCancelMessage("");

    try {
      const response = await axios.post(`/api/bookings/${booking._id}/cancel`);

      setCancelMessage(
        response.data.message || "Booking cancelled successfully.",
      );

      await fetchBookings();
    } catch (err) {
      setCancelMessage(
        err.response?.data?.message ||
          "Unable to cancel this booking. Please check its status before trying again.",
      );
    } finally {
      setCancellingId("");
    }
  }

  if (loading) {
    return (
      <main className="my-bookings-page">
        <nav className="navbar">
          <Link to="/" className="logo">
            Turfly<span>.</span>
          </Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>
        <h1>My Bookings</h1>
        <p>Loading your bookings...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-bookings-page">
        <nav className="navbar">
          <Link to="/" className="logo">
            Turfly<span>.</span>
          </Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>
        <h1>My Bookings</h1>
        <p className="auth-error">{error}</p>
        <Link to="/turfs">Browse turfs</Link>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          Turfly<span>.</span>
        </Link>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <header className="my-bookings-header">
        <div>
          <div className="my-bookings-eyebrow">YOUR TURFLY ACTIVITY</div>
          <h1>My Bookings</h1>
          <p>Every game starts with a great booking.</p>
        </div>

        <div className="my-bookings-count">
          {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
        </div>
      </header>

      {cancelMessage && (
        <p role="status" aria-live="polite">
          {cancelMessage}
        </p>
      )}

      {bookings.length === 0 ? (
        <section className="my-booking-empty">
          <div className="my-booking-empty-icon">🏟️</div>
          <h2>Your next game starts here</h2>
          <p>You haven't made any bookings yet. Find a turf and get playing!</p>
          <Link to="/turfs" className="signup-btn">
            Explore Turfs
          </Link>
        </section>
      ) : (
        <section className="my-bookings-grid">
          {bookings.map((booking) => {
            const statusClass = String(booking.status || "")
              .toLowerCase()
              .replace(/\s+/g, "-");

            const paymentClass = String(booking.paymentStatus || "")
              .toLowerCase()
              .replace(/\s+/g, "-");

            const isPendingUnpaid =
              booking.status === "Pending" &&
              booking.paymentStatus === "Pending";

            const isConfirmedPaid =
              booking.status === "Confirmed" &&
              booking.paymentStatus === "Paid";

            const canCancel = isPendingUnpaid || isConfirmedPaid;
            const isCancelling = cancellingId === booking._id;

            return (
              <article className="my-booking-card" key={booking._id}>
                <div className="my-booking-card-top">
                  <div>
                    <h2>{booking.turf?.name || "Turf unavailable"}</h2>
                    <p className="my-booking-location">
                      📍 {booking.turf?.location || "Location unavailable"}
                    </p>

                    {booking.turf?.sport && (
                      <span className="my-booking-sport">
                        {booking.turf.sport}
                      </span>
                    )}
                  </div>

                  <span className={`my-booking-status ${statusClass}`}>
                    {booking.status}
                  </span>
                </div>

                <hr className="my-booking-divider" />

                <div className="my-booking-details">
                  <div>
                    <span className="my-booking-detail-label">DATE</span>
                    <span className="my-booking-detail-value">
                      {booking.bookingDate}
                    </span>
                  </div>

                  <div>
                    <span className="my-booking-detail-label">TIME SLOT</span>
                    <span className="my-booking-detail-value">
                      {booking.bookingTime}
                    </span>
                  </div>

                  <div>
                    <span className="my-booking-detail-label">
                      PRICE / HOUR
                    </span>
                    <span className="my-booking-detail-value my-booking-price">
                      {booking.turf?.pricePerHour != null
                        ? `₹${booking.turf.pricePerHour}`
                        : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="my-booking-detail-label">BOOKING ID</span>
                    <span className="my-booking-detail-value">
                      {booking._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <footer className="my-booking-footer">
                  <span className="my-booking-payment-label">
                    Payment status
                  </span>
                  <span className={`my-booking-status ${paymentClass}`}>
                    {booking.paymentStatus}
                  </span>
                </footer>

                {canCancel && (
                  <button
                    type="button"
                    className="cancel-booking-btn"
                    onClick={() => handleCancel(booking)}
                    disabled={Boolean(cancellingId)}
                  >
                    {isCancelling
                      ? isConfirmedPaid
                        ? "Requesting Refund..."
                        : "Cancelling..."
                      : isConfirmedPaid
                        ? "Cancel & Request Refund"
                        : "Cancel Booking"}
                  </button>
                )}
              </article>
            );
          })}
        </section>
      )}

      <p style={{ marginTop: "28px" }}>
        <Link to="/turfs">← Explore more turfs</Link>
      </p>
    </main>
  );
}

export default MyBookings;
