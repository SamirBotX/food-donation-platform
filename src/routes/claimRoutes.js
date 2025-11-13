// backend/src/routes/claimRoutes.js
import express from "express";
import {
  createClaim,
  getAllClaims,
  deleteClaim,
  getMyClaims,
} from "../controllers/claimController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Create new claim
router.post("/", protect, createClaim);

// 👤 Logged-in user claims
router.get("/my", protect, getMyClaims);

// 🧾 All claims (admin or charity)
router.get("/", protect, getAllClaims);

// ❌ Delete claim
router.delete("/:id", protect, deleteClaim);

export default router;
