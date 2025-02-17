const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  password: String,
  avatar: { type: String, default: null }, 
  otp: String, 
  otpExpires: Date, 
});

module.exports = mongoose.model("User", userSchema);
