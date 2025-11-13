import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { createUser, findUserByEmail } from "../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { full_name, email, password, phone, role, organization_name, address } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: "Missing fields" });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ full_name, email, password_hash, phone, role, organization_name, address });
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};
