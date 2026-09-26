import express from "express";
import Donor from "../models/Donor.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/donors
router.get("/", auth, async (req, res) => {
  const donors = await Donor.find().sort({ createdAt: -1 });
  res.json(donors);
});

// POST /api/donors
router.post("/", auth, async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/donors/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(donor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/donors/:id (admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  await Donor.findByIdAndDelete(req.params.id);
  res.json({ message: "Donor deleted" });
});

export default router;
