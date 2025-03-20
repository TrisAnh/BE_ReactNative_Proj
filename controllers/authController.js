const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/mailer");
const OtpModel = require("../models/otpModel");
const cloudinary = require("../config/cloudinaryConfig");

const mongoose = require("mongoose");

require("dotenv").config();

exports.register = async (req, res) => {
  try {
    console.log("📥 Dữ liệu nhận từ frontend:", req.body);

    const { fullName, email, phone, address, password, confirmPassword } =
      req.body;

    console.log("✅ Backend nhận được request!");

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      console.log("❌ Thiếu thông tin!");
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin!" });
    }

    if (password !== confirmPassword) {
      console.log("❌ Mật khẩu không khớp!");
      return res.status(400).json({ message: "Mật khẩu không khớp!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      phone,
      address,
      password: hashedPassword,
      // Không cần thêm avatar ở đây, nó sẽ tự động là null
    });

    await newUser.save();
    console.log("✅ Đăng ký thành công!");
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    console.log("User found:", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("Authentication failed");
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Kiểm tra JWT_SECRET có hợp lệ không
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET chưa được định nghĩa!");
      return res
        .status(500)
        .json({ message: "Lỗi server, vui lòng thử lại sau!" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful, token generated");

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra nếu OTP đã tồn tại và chưa hết hạn
    const existingOtp = await OtpModel.findOne({ email });
    if (existingOtp && existingOtp.expiresAt > Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP đã được gửi, vui lòng kiểm tra email!" });
    }

    // Sinh OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào database (cập nhật nếu đã tồn tại)
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true, new: true }
    );

    // Gửi OTP qua email
    await sendOTP(email, otp);

    res.json({ message: "OTP đã được gửi đến email!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OtpModel.findOne({ email, otp });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP không hợp lệ!" });
    if (otpRecord.expiresAt < Date.now())
      return res.status(400).json({ message: "OTP đã hết hạn!" });

    // Xóa OTP sau khi xác nhận thành công
    await OtpModel.deleteOne({ email });

    res.json({ success: true, message: "Xác nhận OTP thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

    // Lưu OTP vào bảng OtpModel (xóa OTP cũ nếu có)
    await Otp.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { upsert: true, new: true }
    );

    // Gửi OTP qua email
    await sendOTP(email, otp);

    res.json({ message: "OTP đã được gửi đến email!" });
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email đã đăng ký chưa
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email chưa được đăng ký!" });
    }

    // Kiểm tra nếu OTP đã tồn tại và chưa hết hạn
    const existingOtp = await OtpModel.findOne({ email });
    if (existingOtp && existingOtp.expiresAt > Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP đã được gửi, vui lòng kiểm tra email!" });
    }

    // Sinh OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào database (cập nhật nếu đã tồn tại)
    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 }, // Hết hạn sau 5 phút
      { upsert: true, new: true }
    );

    // Gửi OTP qua email
    await sendOTP(email, otp);

    res.json({ message: "OTP đã được gửi đến email của bạn!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Tìm OTP trong database
    const otpRecord = await OtpModel.findOne({ email });
    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
    }

    // Xóa OTP sau khi xác thực thành công
    await OtpModel.deleteOne({ email });

    res.json({ message: "OTP hợp lệ! Vui lòng tiếp tục đặt lại mật khẩu." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu mới là bắt buộc!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mật khẩu đã được đặt lại thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đặt lại mật khẩu:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi đặt lại mật khẩu!" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ!" });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin profile:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, address, email, phone } = req.body;
    const userId = req.user._id;

    // Tìm user hiện tại
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    // Kiểm tra xem email hoặc số điện thoại có thay đổi không
    const isEmailChanged = email && email !== currentUser.email;
    const isPhoneChanged = phone && phone !== currentUser.phone;

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};

    // Chỉ cập nhật các trường có giá trị
    if (fullName) updateData.fullName = fullName;
    if (address) updateData.address = address;
    if (isEmailChanged) updateData.email = email;
    if (isPhoneChanged) updateData.phone = phone;

    // Thêm thời gian cập nhật
    updateData.updatedAt = new Date();

    // Cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json({ message: "Cập nhật thông tin thành công!", user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);

    // Kiểm tra lỗi trùng lặp email/phone
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email hoặc số điện thoại đã được sử dụng bởi tài khoản khác!",
      });
    }

    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy user ID từ token (middleware auth)

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên một ảnh!" });
    }

    // Upload ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    // Cập nhật URL avatar vào database
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật avatar", error });
  }
};

exports.getAllRoomCategoriesExamPle = async (req, res) => {
  try {
    // Dữ liệu mẫu cho danh mục phòng
    const roomCategories = [
      {
        name: "Phòng Đơn",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        price: 5000000,
        rating: 4.5,
        roomType: "Phòng Đơn",
        icon: "room1-icon.png",
        isActive: true,
        order: 1,
      },
      {
        name: "Phòng Đôi",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        price: 7000000,
        rating: 4.7,
        roomType: "Phòng Đôi",
        icon: "room2-icon.png",
        isActive: true,
        order: 2,
      },
      {
        name: "Căn Hộ",
        address: "789 Đường LMN, Quận 3, TP.HCM",
        price: 12000000,
        rating: 4.8,
        roomType: "Căn Hộ",
        icon: "apartment-icon.png",
        isActive: true,
        order: 3,
      },
    ];

    res.json(roomCategories);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách danh mục phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.getTopRatedRoomsExamPle = async (req, res) => {
  try {
    // Dữ liệu mẫu cho các phòng được đánh giá cao nhất
    const topRatedRooms = [
      {
        name: "Phòng Đôi",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        price: 7000000,
        rating: 4.7,
        roomType: "Phòng Đôi",
        icon: "room2-icon.png",
      },
      {
        name: "Căn Hộ",
        address: "789 Đường LMN, Quận 3, TP.HCM",
        price: 12000000,
        rating: 4.8,
        roomType: "Căn Hộ",
        icon: "apartment-icon.png",
      },
    ];

    if (!topRatedRooms || topRatedRooms.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phòng nào được đánh giá!" });
    }

    res.json(topRatedRooms);
  } catch (error) {
    console.error("❌ Lỗi khi lấy phòng chạy nhất:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
