import pool from "../config/db.js";

/* --------------------------------------
   ➕ Create Donation
-------------------------------------- */
export async function createDonation({
  donor_id,
  title,
  description,
  food_type,
  category,
  quantity,
  unit,
  pickup_location,
  image_url,
  expires_at,
}) {
  const query = `
    INSERT INTO donations (donor_id, title, description, food_type, category, quantity, unit, pickup_location, image_url, expires_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;
  const values = [donor_id, title, description, food_type, category, quantity, unit, pickup_location, image_url, expires_at];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/* --------------------------------------
   📋 Get All Donations
-------------------------------------- */
export async function getAllDonations() {
  const query = `
    SELECT 
      d.*, 
      c.id AS claim_id,
      c.status AS claim_status,
      u2.full_name AS claimed_by_name,
      u2.email AS claimed_by_email,
      u2.phone AS claimed_by_phone
    FROM donations d
    LEFT JOIN claims c ON d.id = c.donation_id
    LEFT JOIN users u2 ON c.charity_id = u2.id
    ORDER BY d.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

/* --------------------------------------
   📋 Get All Donations By Donor
-------------------------------------- */
export async function getAllDonationsByDonor(donor_id) {
  const query = `
    SELECT 
      d.*, 
      c.id AS claim_id,
      c.status AS claim_status,
      u2.full_name AS claimed_by_name,
      u2.email AS claimed_by_email,
      u2.phone AS claimed_by_phone
    FROM donations d
    LEFT JOIN claims c ON d.id = c.donation_id
    LEFT JOIN users u2 ON c.charity_id = u2.id
    WHERE d.donor_id = $1
    ORDER BY d.created_at DESC;
  `;
  const result = await pool.query(query, [donor_id]);
  return result.rows;
}

/* --------------------------------------
   📦 Get Donation By ID
-------------------------------------- */
export async function getDonationById(id) {
  const query = `
    SELECT 
      d.*, 
      c.id AS claim_id,
      c.status AS claim_status,
      u2.full_name AS claimed_by_name,
      u2.email AS claimed_by_email,
      u2.phone AS claimed_by_phone
    FROM donations d
    LEFT JOIN claims c ON d.id = c.donation_id
    LEFT JOIN users u2 ON c.charity_id = u2.id
    WHERE d.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

/* --------------------------------------
   🔁 Update Donation Status
-------------------------------------- */
export async function updateDonationStatus(id, status) {
  const query = `
    UPDATE donations
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
}
