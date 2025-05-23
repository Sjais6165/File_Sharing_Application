

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 🔹 User Signup Route
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const newUser = new User({ username, password }); // Mongoose pre-save hook handles hashing
        await newUser.save();

        console.log("✅ User registered:", username);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Signup Error:", error.message);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

// 🔹 User Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log("❌ User not found:", username);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log("❌ Password mismatch for:", username);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ Login successful for:", username);
        res.status(200).json({
            token,
            message: "Login successful!",
            user: { username: user.username }
        });
    } catch (error) {
        console.error("❌ Login error:", error.message);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

// 🧪 Bcrypt test route (optional for debugging)
router.get("/test-bcrypt", async (req, res) => {
    const plain = "123456";
    const hashed = await bcrypt.hash(plain, 10);
    const result = await bcrypt.compare(plain, hashed);
    console.log("🔍 Bcrypt test result:", result);
    res.send({ success: result });
});

export default router;

