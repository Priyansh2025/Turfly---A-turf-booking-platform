const express = require("express");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");
const { protect } = require("../middleware/authMiddleware");
const crypto = require("crypto");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const HOLD_MINUTES = 10;

const ALLOWED_TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function getIndiaDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

router.post("/", protect, async (req, res) => {
  let booking;

  try {
    const { turfId, bookingDate, bookingTime } = req.body;

    if (!mongoose.isValidObjectId(turfId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid turf ID.",
      });
    }

    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
      typeof bookingTime !== "string" ||
      !ALLOWED_TIMES.includes(bookingTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid date and time slot.",
      });
    }

    const parsedDate = new Date(`${bookingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date.",
      });
    }

    const now = getIndiaDateTime();
    const today = `${now.year}-${now.month}-${now.day}`;

    if (
      bookingDate < today ||
      (bookingDate === today && bookingTime <= `${now.hour}:${now.minute}`)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please choose a future date and time slot.",
      });
    }

    const turf = await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found.",
      });
    }

    // Release expired temporary holds before checking availability.
    await Booking.updateMany(
      {
        turf: turfId,
        bookingDate,
        bookingTime,
        status: "Pending",
        paymentStatus: "Pending",
        holdExpiresAt: { $lte: new Date() },
      },
      { $set: { status: "Expired" } },
    );

    // The unique MongoDB index is the final protection against races.
    booking = await Booking.create({
      user: req.userId,
      turf: turfId,
      bookingDate,
      bookingTime,
      status: "Pending",
      paymentStatus: "Pending",
      holdExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
    });

    // Razorpay expects the amount in paise.
    const amount = Math.round(turf.pricePerHour * 100);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { status: "Expired" } },
      );

      return res.status(400).json({
        success: false,
        message: "This turf has an invalid booking price.",
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        turfId: turf._id.toString(),
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Slot held temporarily. Complete payment within 10 minutes.",
      bookingId: booking._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      holdExpiresAt: booking.holdExpiresAt,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Booking order creation error:", error);

    if (booking?._id) {
      await Booking.updateOne(
        { _id: booking._id, status: "Pending" },
        { $set: { status: "Expired" } },
      ).catch((cleanupError) => {
        console.error("Booking cleanup error:", cleanupError);
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please choose another.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to start payment. Please try again.",
    });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !mongoose.isValidObjectId(bookingId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid payment details.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Make verification idempotent for an already-confirmed booking.
    if (
      booking.status === "Confirmed" &&
      booking.paymentStatus === "Paid" &&
      booking.razorpayPaymentId === razorpay_payment_id
    ) {
      return res.json({
        success: true,
        message: "Booking already confirmed.",
        booking,
      });
    }

    if (
      booking.status !== "Pending" ||
      booking.paymentStatus !== "Pending" ||
      booking.razorpayOrderId !== razorpay_order_id ||
      !booking.holdExpiresAt ||
      booking.holdExpiresAt <= new Date()
    ) {
      return res.status(409).json({
        success: false,
        message: "The booking hold has expired or is no longer valid.",
      });
    }

    // Verify Razorpay's signature using the secret stored on the server.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Verify payment status and order association directly with Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.currency !== "INR"
    ) {
      return res.status(409).json({
        success: false,
        message: "Payment is not captured yet. Please try again shortly.",
      });
    }

    const turf = await Turf.findById(booking.turf);

    if (!turf || payment.amount !== Math.round(turf.pricePerHour * 100)) {
      return res.status(409).json({
        success: false,
        message: "Payment amount does not match the booking.",
      });
    }

    // Atomic conditional update: don't confirm an expired or changed booking.
    const confirmedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        user: req.userId,
        status: "Pending",
        paymentStatus: "Pending",
        razorpayOrderId: razorpay_order_id,
        holdExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: "Confirmed",
          paymentStatus: "Paid",
          razorpayPaymentId: razorpay_payment_id,
          holdExpiresAt: null,
        },
      },
      { new: true },
    );

    if (!confirmedBooking) {
      return res.status(409).json({
        success: false,
        message:
          "The booking hold expired. Contact support if payment was deducted.",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified! Your turf is booked.",
      booking: confirmedBooking,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify payment. Please contact support before retrying.",
    });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.userId,
    })
      .populate("turf", "name location sport pricePerHour")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your bookings.",
    });
  }
});

router.post("/:id/cancel", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status !== "Confirmed" && booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled.",
      });
    }

    // Case 1: Payment has already been completed.
    if (booking.paymentStatus === "Paid") {
      if (!booking.razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment details are missing. Please contact support.",
        });
      }

      // Confirm the payment with Razorpay before issuing a refund.
      const payment = await razorpay.payments.fetch(booking.razorpayPaymentId);

      if (payment.status !== "captured" || payment.currency !== "INR") {
        return res.status(409).json({
          success: false,
          message: "Payment is not eligible for an automatic refund.",
        });
      }

      const turf = await Turf.findById(booking.turf);

      if (!turf || payment.amount !== Math.round(turf.pricePerHour * 100)) {
        return res.status(409).json({
          success: false,
          message: "Payment amount could not be verified.",
        });
      }

      // Request a full refund from Razorpay.
      const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: payment.amount,
        notes: {
          bookingId: booking._id.toString(),
          reason: "Customer cancelled booking",
        },
      });

      // Only release the slot after Razorpay accepts the refund request.
      booking.status = "Cancelled";
      booking.paymentStatus = "Refunded";
      booking.holdExpiresAt = null;
      await booking.save();

      return res.status(200).json({
        success: true,
        message:
          "Booking cancelled and refund requested successfully. The refund may take time to reach your account.",
        refundId: refund.id,
        booking,
      });
    }

    // Case 2: No payment has been completed.
    if (booking.paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This payment status cannot be cancelled automatically.",
      });
    }

    booking.status = "Cancelled";
    booking.holdExpiresAt = null;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled. The time slot is available again.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete cancellation. Check the booking and refund status before retrying.",
    });
  }
});

module.exports = router;
