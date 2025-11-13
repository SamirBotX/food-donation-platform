// backend/src/controllers/donationController.js
import pool from "../config/db.js";

/**
 * 📦 Admin — Get all donations
 */
export const getAllDonations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM donations ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching donations:", err.message);
    res.status(500).json({ error: "Failed to load donations" });
  }
};

/**
 * 🌿 PUBLIC — Get available donations with remaining quantity
 */
export const getPublicAvailableDonations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        COALESCE(SUM(c.quantity), 0) AS total_claimed,
        (d.quantity - COALESCE(SUM(c.quantity), 0)) AS remaining_qty
      FROM donations d
      LEFT JOIN claims c ON c.donation_id = d.id
      WHERE d.status = 'open'
      GROUP BY d.id
      HAVING (d.quantity - COALESCE(SUM(c.quantity), 0)) > 0
      ORDER BY d.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching available donations:", err.message);
    res.status(500).json({ error: "Failed to load available donations" });
  }
};

/**
 * ➕ Create a donation (Donor only)
 */
export const createDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      unit,
      pickup_location,
      expires_at,
      food_type,
      image_url,
    } = req.body;

    const donorId = req.user.id;

    const result = await pool.query(
      `
      INSERT INTO donations 
        (title, description, quantity, unit, pickup_location, expires_at, food_type, image_url, donor_id, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open')
      RETURNING *
      `,
      [
        title,
        description,
        quantity,
        unit,
        pickup_location,
        expires_at,
        food_type,
        image_url,
        donorId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating donation:", err.message);
    res.status(500).json({ error: "Failed to create donation" });
  }
};

/**
 * 👨‍🍳 Donor — Get donations with claimed + remaining summary
 */
export const getMyDonations = async (req, res) => {
  try {
    const donorId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        d.*,
        COALESCE(SUM(c.quantity), 0) AS total_claimed,
        COUNT(c.id) AS claim_count,
        (d.quantity - COALESCE(SUM(c.quantity), 0)) AS remaining_qty
      FROM donations d
      LEFT JOIN claims c ON c.donation_id = d.id
      WHERE d.donor_id = $1
      GROUP BY d.id
      ORDER BY d.created_at DESC
      `,
      [donorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching your donations:", err.message);
    res.status(500).json({ error: "Failed to load your donations" });
  }
};

/**
 * 🔍 Donor — Get ONE donation by ID (for editing)
 */
export const getDonationById = async (req, res) => {
  try {
    const donorId = req.user.id;
    const donationId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM donations WHERE id = $1 AND donor_id = $2`,
      [donationId, donorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Donation not found or not yours" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error loading donation:", err.message);
    res.status(500).json({ error: "Failed to load donation" });
  }
};

/**
 * 👥 Donor — Get claims for your donation
 */
export const getDonationClaims = async (req, res) => {
  try {
    const donationId = req.params.id;
    const donorId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        c.id AS claim_id,
        c.quantity,
        c.pickup_time,
        c.status AS claim_status,
        u.full_name AS charity_name,
        u.email AS charity_email
      FROM claims c
      JOIN users u ON u.id = c.charity_id
      JOIN donations d ON d.id = c.donation_id
      WHERE d.id = $1 AND d.donor_id = $2
      ORDER BY c.created_at DESC
      `,
      [donationId, donorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching donation claims:", err.message);
    res.status(500).json({ error: "Failed to load donation claims" });
  }
};

/**
 * ✏️ Donor — Update donation
 */
export const updateDonation = async (req, res) => {
  try {
    const donorId = req.user.id;
    const donationId = req.params.id;

    const {
      title,
      description,
      quantity,
      unit,
      pickup_location,
      expires_at,
      food_type,
      image_url,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE donations
      SET 
        title=$1,
        description=$2,
        quantity=$3,
        unit=$4,
        pickup_location=$5,
        expires_at=$6,
        food_type=$7,
        image_url=$8,
        updated_at=NOW()
      WHERE id=$9 AND donor_id=$10
      RETURNING *
      `,
      [
        title,
        description,
        quantity,
        unit,
        pickup_location,
        expires_at,
        food_type,
        image_url,
        donationId,
        donorId,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Donation not found or not yours" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating donation:", err.message);
    res.status(500).json({ error: "Failed to update donation" });
  }
};

/**
 * ❌ Donor — Delete donation
 */
export const deleteDonation = async (req, res) => {
  try {
    const donorId = req.user.id;
    const donationId = req.params.id;

    const result = await pool.query(
      "DELETE FROM donations WHERE id=$1 AND donor_id=$2 RETURNING *",
      [donationId, donorId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Donation not found or not yours" });

    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    console.error("Error deleting donation:", err.message);
    res.status(500).json({ error: "Failed to delete donation" });
  }
};
