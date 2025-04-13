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
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
  updateAvatar,
} = require("../controllers/authController");
const {
  getRoomCategories,
  getTopRatedRooms,
  getRoomsByCategory,
  searchAndFilterRooms,
  getRoomDetail,
} = require("../controllers/categoryController");
const {
  createViewing,
  getAllViewings,
  deleteViewing,
  getViewingById,
} = require("../controllers/viewingController");
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

router.get("/room-categories", getRoomCategories);
router.get("/getTopRatedRooms", getTopRatedRooms);
router.get("/category/:category", getRoomsByCategory);
router.get("/search", searchAndFilterRooms);
router.get("/detail/:roomId", getRoomDetail);

router.post("/viewings", createViewing);
router.get("/getAllViewings", getAllViewings);
router.delete("/deleteViewing/:id", deleteViewing);
router.get("/getViewing/:id", getViewingById);
module.exports = router;
