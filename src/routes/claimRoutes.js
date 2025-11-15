// backend/src/routes/claimRoutes.js
import express from "express";
import {
  createClaim,
  getMyClaims,
  getDonationClaims,
  markClaimPickedUp,
  cancelClaim,
  deleteClaim,
} from "../controllers/claimController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Create claim
router.post("/", protect, createClaim);

// 👤 Charity — get my claims
router.get("/my", protect, getMyClaims);

// 👨‍🍳 Donor — view claims on my donation
router.get("/donation/:id", protect, getDonationClaims);

// 🟢 Donor marks claim picked up
router.put("/:id/pickup", protect, markClaimPickedUp);

// 🔴 Donor/Charity cancel claim
router.put("/:id/cancel", protect, cancelClaim);

// ❌ Delete claim (admin or charity)
router.delete("/:id", protect, deleteClaim);

export default router;
