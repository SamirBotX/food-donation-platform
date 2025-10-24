// backend/models/donationModel.js
import pool from "../src/config/db.js";

// Add a new donation
export const createDonation = async ({ donor_id, title, description, food_type, quantity, unit, expires_at }) => {
  const query = `
    INSERT INTO donations (donor_id, title, description, food_type, quantity, unit, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [donor_id, title, description, food_type, quantity, unit, expires_at];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all donations
export const getAllDonations = async () => {
  const result = await pool.query("SELECT * FROM donations ORDER BY created_at DESC");
  return result.rows;
};

// Get donation by ID
export const getDonationById = async (id) => {
  const result = await pool.query("SELECT * FROM donations WHERE id = $1", [id]);
  return result.rows[0];
};

// Update donation status
export const updateDonationStatus = async (id, status) => {
  const query = `
    UPDATE donations SET status = $1 WHERE id = $2 RETURNING *;
  `;
  const values = [status, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};
