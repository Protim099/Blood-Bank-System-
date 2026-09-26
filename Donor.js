import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: Number,
    gender: String,
    bloodGroup: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    lastDonationDate: Date,
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Donor", donorSchema);
