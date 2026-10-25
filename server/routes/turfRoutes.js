const express = require("express");
const mongoose = require("mongoose");
const Turf = require("../models/Turf");

const router = express.Router();

// GET all turf listings
router.get("/", async (req, res) => {
  try {
    const turfs = await Turf.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: turfs.length,
      turfs,
    });
  } catch (error) {
    console.error("Error fetching turfs:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch turf listings.",
    });
  }
});

/* GET: Fetch one turf by ID */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid turf ID.",
      });
    }

    const turf = await Turf.findById(id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found.",
      });
    }

    return res.status(200).json({
      success: true,
      turf,
    });
  } catch (error) {
    console.error("Error fetching turf:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch turf details.",
    });
  }
});

/* POST: Add a new turf */
router.post("/", async (req, res) => {
  try {
    const { name, location, sport, pricePerHour, image, description } =
      req.body;

    const turf = await Turf.create({
      name,
      location,
      sport,
      pricePerHour,
      image,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Turf created successfully!",
      turf,
    });
  } catch (error) {
    console.error("Error creating turf:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
