// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";  // ✅ Database connection
import userRoutes from "../routes/userRoutes.js"; // ✅ User routes
import donationRoutes from "../routes/donationRoutes.js"; // ✅ Donation routes

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());            
app.use(express.json());    

// 1️⃣ Root Route — Just to Check Server
app.get("/", (req, res) => {
  res.send("✅ Food Donation Platform Server is running successfully!");
});

// 2️⃣ Test Database Connection Route
app.get("/api/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "✅ Connected to PostgreSQL Database!",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 3️⃣ API Routes
app.use("/api/users", userRoutes); // ✅ User routes
app.use("/api/donations", donationRoutes); // ✅ Donation routes


// 4️⃣ Start the Server
const PORT = process.env.PORT || 5050;
app.listen(PORT,() => console.log(`🚀 Server running on http://localhost:${PORT}`));
