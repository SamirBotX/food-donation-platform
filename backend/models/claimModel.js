// backend/models/claimModel.js
import pool from "../src/config/db.js";

// Create a new claim
export const createClaim = async ({ donation_id, claimed_by_user, quantity, pickup_time }) => {
  const query = `
    INSERT INTO claims (donation_id, claimed_by_user, quantity, pickup_time)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [donation_id, claimed_by_user, quantity, pickup_time];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all claims
export const getAllClaims = async () => {
  const result = await pool.query(`
    SELECT c.*, d.title AS donation_title, u.full_name AS claimed_by_name
    FROM claims c
    JOIN donations d ON c.donation_id = d.id
    JOIN users u ON c.claimed_by_user = u.id
    ORDER BY c.created_at DESC;
  `);
  return result.rows;
};

// Update claim status
export const updateClaimStatus = async (id, status) => {
  const query = `
    UPDATE claims SET status = $1 WHERE id = $2 RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};
