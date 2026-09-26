import express from "express";
import BloodStock from "../models/BloodStock.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/stocks
router.get("/", auth, async (req, res) => {
  const stocks = await BloodStock.find().sort({ bloodGroup: 1 });
  res.json(stocks);
});

// POST /api/stocks — set the unit count for a blood group (creates it if missing)
router.post("/", auth, async (req, res) => {
  try {
    const units = Math.max(0, Number(req.body.units) || 0);

    const stock = await BloodStock.findOneAndUpdate(
      { bloodGroup: req.body.bloodGroup },
      { $set: { units } },
      { upsert: true, new: true }
    );

    res.json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
