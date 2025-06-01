import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust path as needed

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB using the decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user; // Now req.user.assignedVenueId will be available
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};
