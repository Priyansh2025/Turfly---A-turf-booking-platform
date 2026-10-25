const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  try {
    // Read the JWT from the cookie

    const token = req.cookies?.turfbook_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource.",
      });
    }

    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make the user ID available to the next handler
    req.userId = decoded.userId;

    // Allow the request to continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

module.exports = { protect };
