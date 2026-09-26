import express from "express";
import Hospital from "../models/Hospital.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/hospitals
router.get("/", auth, async (req, res) => {
  const hospitals = await Hospital.find().sort({ createdAt: -1 });
  res.json(hospitals);
});

// POST /api/hospitals
router.post("/", auth, async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/hospitals/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/hospitals/:id (admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  await Hospital.findByIdAndDelete(req.params.id);
  res.json({ message: "Hospital deleted" });
});

export default router;
