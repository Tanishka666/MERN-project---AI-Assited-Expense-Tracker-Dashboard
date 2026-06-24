import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  monthlyBudget: {
    type: Number,
    default: 50000
  },

  alertBudget: {
    type: Number,
    default: 20000
  },

  alertEmailCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
