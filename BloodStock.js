import mongoose from "mongoose";

const bloodStockSchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, required: true, unique: true },
    units: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("BloodStock", bloodStockSchema);
