const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
