// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * ✅ Protect middleware
 * Verifies JWT and attaches the full user record to req.user
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch the user from the database
    const userQuery = await pool.query(
      "SELECT id, full_name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userQuery.rowCount === 0) {
      return res.status(403).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = userQuery.rows[0];
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * 👑 Admin-only middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/**
 * 🎯 Role-based authorization middleware
 * Usage: router.post("/something", protect, authorizeRoles("donor", "admin"), handler);
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized for this role" });
    }
    next();
  };
};
