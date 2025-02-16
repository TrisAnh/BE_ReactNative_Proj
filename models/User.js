const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  password: String,
  avatar: { type: String, default: null }, // Thêm trường avatar với giá trị mặc định là null
  otp: String, // Lưu OTP
  otpExpires: Date, // Thời gian hết hạn OTP
});

module.exports = mongoose.model("User", userSchema);
