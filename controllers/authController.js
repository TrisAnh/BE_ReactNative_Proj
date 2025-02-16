const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/mailer");

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

// 📌 Đăng nhập
exports.login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body); // Log dữ liệu đăng nhập
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    console.log("User found:", user); // Log thông tin user tìm được

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("Authentication failed"); // Log khi xác thực thất bại
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful, token generated"); // Log khi đăng nhập thành công
    res.json({ message: "Đăng nhập thành công!", token });
  } catch (error) {
    console.error("Login error:", error); // Log chi tiết lỗi
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// 📌 Gửi OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút
    await user.save();

    await sendOTP(email, otp);

    res.json({ message: "OTP đã được gửi đến email!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};

// 📌 Xác thực OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Xác thực OTP thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -otp");
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
    const { fullName, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, address },
      { new: true, runValidators: true }
    ).select("-password -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json({ message: "Cập nhật thông tin thành công!", user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Không có file ảnh được tải lên!" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 200,
      crop: "scale",
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json({ message: "Cập nhật avatar thành công!", user: updatedUser });
  } catch (error) {
    console.error("Lỗi khi cập nhật avatar:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
