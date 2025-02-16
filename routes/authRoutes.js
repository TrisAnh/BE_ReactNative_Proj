const express = require("express");
const {
  register,
  login,
  sendOTP,
  verifyOTP,
  getProfile,
  updateAvatar,
  updateProfile,
  sendChangeEmailOTP,
  verifyAndChangeEmail,
  sendChangePhoneOTP,
  verifyAndChangePhone,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/getProfile", getProfile);
router.put("/updateavatar", updateAvatar);
router.put("/updateProfile", updateProfile);
router.post("/send-change-email-otp", sendChangeEmailOTP);
router.post("/verify-change-email", verifyAndChangeEmail);
router.post("/send-change-phone-otp", sendChangePhoneOTP);
router.post("/verify-change-phone", verifyAndChangePhone);
module.exports = router;
