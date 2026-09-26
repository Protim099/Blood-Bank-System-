import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import BloodStock from "../models/BloodStock.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/requests
router.get("/", auth, async (req, res) => {
  const requests = await BloodRequest.find()
    .populate("hospital")
    .sort({ createdAt: -1 });
  res.json(requests);
});

// POST /api/requests
router.post("/", auth, async (req, res) => {
  try {
    const request = await BloodRequest.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/requests/:id/status (admin only)
// Moves a request through pending -> approved/rejected -> issued.
// Stock availability is checked before approving, and units are deducted
// from stock only once, at the moment a request is issued.
router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (status === "approved") {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      if (!stock || stock.units < request.units) {
        return res.status(400).json({ message: "Insufficient blood stock" });
      }
    }

    if (status === "issued" && request.status !== "issued") {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      if (!stock || stock.units < request.units) {
        return res.status(400).json({ message: "Insufficient blood stock" });
      }
      stock.units -= request.units;
      await stock.save();
    }

    request.status = status;
    await request.save();

    res.json(await request.populate("hospital"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
