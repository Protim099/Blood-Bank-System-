import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    type: String
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", hospitalSchema);
