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
  resendOTP,
  getAllRoomCategoriesExamPle,
  getTopRatedRoomsExamPle,
} = require("../controllers/authController");
const {
  getAllRoomCategories,
  getTopRatedRooms,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/getProfile", getProfile);
router.put("/updateAvatar", updateAvatar);
router.put("/updateProfile", updateProfile);
router.post("/send-change-email-otp", sendChangeEmailOTP);
router.post("/verify-change-email", verifyAndChangeEmail);
router.post("/send-change-phone-otp", sendChangePhoneOTP);
router.post("/verify-change-phone", verifyAndChangePhone);

router.get("/getAllRoomCategories", getAllRoomCategories);
router.get("/getTopRatedRooms", getTopRatedRooms);
router.get("/123", getAllRoomCategoriesExamPle);
router.get("/getTopRatedRoomsExamPle", getTopRatedRoomsExamPle);
module.exports = router;
