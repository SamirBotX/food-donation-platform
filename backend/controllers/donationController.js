// backend/controllers/donationController.js
import { createDonation, getAllDonations, getDonationById, updateDonationStatus } from "../models/donationModel.js";

// POST /api/donations
export async function addDonation(req, res) {
  try {
    const { donor_id, title, description, food_type, quantity, unit, expires_at } = req.body;

    if (!donor_id || !title || !quantity) {
      return res.status(400).json({ error: "donor_id, title, and quantity are required" });
    }

    const donation = await createDonation({ donor_id, title, description, food_type, quantity, unit, expires_at });
    res.status(201).json(donation);
  } catch (error) {
    console.error("❌ Error adding donation:", error.message);
    res.status(500).json({ error: "Error adding donation" });
  }
}

// GET /api/donations
export async function listDonations(req, res) {
  try {
    const donations = await getAllDonations();
    res.json(donations);
  } catch (error) {
    console.error("❌ Error fetching donations:", error.message);
    res.status(500).json({ error: "Error fetching donations" });
  }
}

// GET /api/donations/:id
export async function viewDonation(req, res) {
  try {
    const { id } = req.params;
    const donation = await getDonationById(id);

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(donation);
  } catch (error) {
    console.error("❌ Error fetching donation:", error.message);
    res.status(500).json({ error: "Error fetching donation" });
  }
}

// PUT /api/donations/:id/status
export async function changeDonationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "claimed", "closed", "expired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await updateDonationStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating status:", error.message);
    res.status(500).json({ error: "Error updating status" });
  }
}
