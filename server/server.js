const express = require("express");

const app = express();

const PORT = 5000;

// Middleware to read JSON request bodies
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("Welcome to Turfly API!");
});

// Health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Turfly server is running!",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Turfly server running on http://localhost:${PORT}`);
});
