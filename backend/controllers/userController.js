// backend/controllers/userController.js
import { getAllUsers, registerUser, loginUser } from "../models/userModel.js";

// GET /api/users
export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "Error fetching users" });
  }
}

// POST /api/users/register
export async function register(req, res) {
  try {
    const { email, password, full_name, organization_name, role, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    const user = await registerUser({ email, password, full_name, organization_name, role, phone });
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ error: "Error registering user" });
  }
}

// POST /api/users/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await loginUser({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("❌ Error logging in:", error.message);
    res.status(500).json({ error: "Error logging in" });
  }
}
