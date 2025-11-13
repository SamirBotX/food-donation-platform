// backend/src/config/db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";   // Import dotenv to read .env file

dotenv.config();               // Load variables from .env file


const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/food_donation",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB connection error:", err.message));

export default pool;
