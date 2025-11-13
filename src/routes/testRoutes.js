// backend/src/routes/testRoutes.js
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js"; // 👈 Add this import

const router = express.Router();

// 🧠 GET /api/test-db → confirms DB connection
router.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    res.status(200).json({
      success: true,
      message: "✅ Database connection successful",
      server_time: result.rows[0].server_time,
    });
  } catch (err) {
    console.error("❌ Database test failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// 🔐 GET /api/test-protected → confirms JWT token works
router.get("/test-protected", protect, (req, res) => {
  res.json({
    success: true,
    message: `Welcome ${req.user.full_name}!`,
    role: req.user.role,
    userId: req.user.id,
  });
});

export default router;
