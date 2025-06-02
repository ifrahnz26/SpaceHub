import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to verify JWT token and attach user info to request
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the full user object from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Attach the full user object to the request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};
