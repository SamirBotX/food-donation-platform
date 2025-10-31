// backend/routes/claimRoutes.js
import express from "express";
import { addClaim, listClaims, changeClaimStatus } from "../controllers/claimController.js";

const router = express.Router();

router.post("/", addClaim); // Create a claim
router.get("/", listClaims); // View all claims
router.put("/:id/status", changeClaimStatus); // Update claim status

export default router;
