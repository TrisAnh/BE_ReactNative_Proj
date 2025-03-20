const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../config/multerConfig");

const {
  register,
  login,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  resendOTP,
  getAllRoomCategoriesExamPle,
  getTopRatedRoomsExamPle,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  updateAvatar,
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
router.post("/send-otpForgot", sendForgotPasswordOTP);
router.post("/verify-otpForgot", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getProfile);
router.put("/update-avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/updateProfile", protect, updateProfile);

router.get("/getAllRoomCategories", getAllRoomCategories);
router.get("/getTopRatedRooms", getTopRatedRooms);
router.get("/123", getAllRoomCategoriesExamPle);
router.get("/getTopRatedRoomsExamPle", getTopRatedRoomsExamPle);
module.exports = router;
