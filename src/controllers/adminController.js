// src/controllers/adminController.js
import pool from "../config/db.js";

/**
 * 👥 Get all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY id ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * 🥗 Get all donations (for admin dashboard)
 */
export const getAllDonations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.title, d.description, d.quantity, d.unit, d.status, 
              d.pickup_location, d.created_at, u.full_name AS donor_name
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       ORDER BY d.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching donations:", err.message);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
};

/**
 * 📦 Get all claims (for admin dashboard)
 */
export const getAllClaims = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, c.pickup_time, c.status, c.created_at,
              d.title AS donation_title, 
              u.full_name AS claimed_by
       FROM claims c
       LEFT JOIN donations d ON c.donation_id = d.id
       LEFT JOIN users u ON c.charity_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching claims:", err.message);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
};
