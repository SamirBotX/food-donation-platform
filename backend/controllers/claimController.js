// backend/controllers/claimController.js
import { createClaim, getAllClaims, updateClaimStatus } from "../models/claimModel.js";

// POST /api/claims
export const addClaim = async (req, res) => {
  try {
    const { donation_id, claimed_by_user, quantity, pickup_time } = req.body;

    if (!donation_id || !claimed_by_user || !quantity) {
      return res.status(400).json({ error: "donation_id, claimed_by_user, and quantity are required" });
    }

    const claim = await createClaim({ donation_id, claimed_by_user, quantity, pickup_time });
    res.status(201).json(claim);
  } catch (error) {
    console.error("❌ Error creating claim:", error.message);
    res.status(500).json({ error: "Error creating claim" });
  }
};

// GET /api/claims
export const listClaims = async (req, res) => {
  try {
    const claims = await getAllClaims();
    res.json(claims);
  } catch (error) {
    console.error("❌ Error fetching claims:", error.message);
    res.status(500).json({ error: "Error fetching claims" });
  }
};

// PUT /api/claims/:id/status
export const changeClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["reserved", "picked_up", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedClaim = await updateClaimStatus(id, status);
    if (!updatedClaim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    res.json(updatedClaim);
  } catch (error) {
    console.error("❌ Error updating claim status:", error.message);
    res.status(500).json({ error: "Error updating claim status" });
  }
};
