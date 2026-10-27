import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../App.css";

function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleBookingPayment() {
    if (!bookingDate || !bookingTime) {
      alert("Please select both a booking date and time slot.");
      return;
    }

    // Validate the selected slot using Indian local time.
    const now = new Date();
    const [year, month, day] = bookingDate.split("-").map(Number);
    const [hour, minute] = bookingTime.split(":").map(Number);
    const selected = new Date(year, month - 1, day, hour, minute);

    if (selected <= now) {
      alert("Please choose a future date and time slot.");
      return;
    }

    try {
      // Load Razorpay Checkout.
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Unable to load Razorpay."));
          document.body.appendChild(script);
        });
      }

      // Create the temporary slot hold and payment order.
      const orderResponse = await axios.post("/api/bookings", {
        turfId: turf._id,
        bookingDate,
        bookingTime,
      });

      const order = orderResponse.data;

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Turfly",
        description: `Booking: ${turf.name}`,
        order_id: order.orderId,
        prefill: {},
        theme: { color: "#16803d" },

        handler: async function (paymentResponse) {
          try {
            const verification = await axios.post("/api/bookings/verify", {
              bookingId: order.bookingId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verification.data.success) {
              alert("Payment successful! Your turf is booked.");
              navigate("/dashboard");
            }
          } catch (error) {
            alert(
              error.response?.data?.message ||
                "Payment received, but verification is pending. Please contact support before paying again.",
            );
          }
        },

        modal: {
          ondismiss: function () {
            alert(
              "Checkout closed. Your slot hold may remain active for up to 10 minutes.",
            );
          },
        },
      });

      checkout.on("payment.failed", function (response) {
        alert(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      checkout.open();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to start checkout. Please try again.",
      );
    }
  }

  useEffect(() => {
    async function fetchTurf() {
      try {
        const response = await axios.get(`/api/turfs/${id}`);
        setTurf(response.data.turf);
      } catch (err) {
        setError("Unable to load this turf. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTurf();
  }, [id]);

  if (loading) return <p>Loading turf details...</p>;
  if (error) return <p className="auth-error">{error}</p>;
  if (!turf) return <p>Turf not found.</p>;

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

      <main className="turf-details">
        <Link to="/turfs" className="back-link">
          ← Back to turfs
        </Link>

        <div className="turf-details-card">
          {turf.image && (
            <img
              className="turf-details-image"
              src={turf.image}
              alt={turf.name}
            />
          )}

          <div className="turf-details-content">
            <span className="turf-sport-tag">{turf.sport}</span>
            <h1>{turf.name}</h1>
            <p className="turf-location">{turf.location}</p>

            <p className="turf-details-description">
              {turf.description || "A great place to enjoy your next game."}
            </p>

            <p className="turf-details-price">
              <strong>₹{turf.pricePerHour}</strong> / hour
            </p>

            <button
              className="signup-btn"
              onClick={() => setShowBookingForm(true)}
            >
              Book Now
            </button>

            {showBookingForm && (
              <div className="booking-form">
                <h2>Book {turf.name}</h2>
                <p>Select your preferred date and time.</p>

                <label htmlFor="bookingDate">Booking date</label>
                <input
                  id="bookingDate"
                  type="date"
                  value={bookingDate}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />

                <label htmlFor="bookingTime">Time slot</label>
                <select
                  id="bookingTime"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                >
                  <option value="">Select a time slot</option>
                  <option value="06:00">6:00 AM – 7:00 AM</option>
                  <option value="07:00">7:00 AM – 8:00 AM</option>
                  <option value="08:00">8:00 AM – 9:00 AM</option>
                  <option value="17:00">5:00 PM – 6:00 PM</option>
                  <option value="18:00">6:00 PM – 7:00 PM</option>
                  <option value="19:00">7:00 PM – 8:00 PM</option>
                  <option value="20:00">8:00 PM – 9:00 PM</option>
                </select>

                <button
                  type="button"
                  className="signup-btn"
                  onClick={handleBookingPayment}
                >
                  Pay & Book
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TurfDetails;
