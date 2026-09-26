import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true, min: 1 },
    emergency: { type: Boolean, default: false },
    reason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("BloodRequest", bloodRequestSchema);
