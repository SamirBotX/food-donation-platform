// backend/routes/userRoutes.js
import express from "express";
import { getUsers, register, login } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users → list all users
router.get("/", getUsers);

// POST /api/users/register → add new user
router.post("/register", register);

// POST /api/users/login → login user
router.post("/login", login);

export default router;
