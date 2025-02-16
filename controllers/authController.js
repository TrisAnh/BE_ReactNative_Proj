const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/mailer");
const cloudinary = require("../config/cloudinary");
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
exports.sendChangeEmailOTP = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email đã được sử dụng bởi tài khoản khác!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: otp,
      type: "email",
      expires: new Date(Date.now() + 10 * 60 * 1000), // OTP hết hạn sau 10 phút
    };
    await user.save();

    await sendOTP(newEmail, otp);

    res.json({ message: "OTP đã được gửi đến email mới!" });
  } catch (error) {
    console.error("Lỗi khi gửi OTP thay đổi email:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.verifyAndChangeEmail = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    if (
      !user.otp ||
      user.otp.code !== otp ||
      user.otp.type !== "email" ||
      user.otp.expires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
    }

    user.email = newEmail;
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({
      message: "Email đã được thay đổi thành công!",
      email: newEmail,
    });
  } catch (error) {
    console.error("Lỗi khi xác thực và thay đổi email:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.sendChangePhoneOTP = async (req, res) => {
  try {
    const { newPhone } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    const existingUser = await User.findOne({ phone: newPhone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Số điện thoại đã được sử dụng bởi tài khoản khác!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: otp,
      type: "phone",
      expires: new Date(Date.now() + 10 * 60 * 1000), // OTP hết hạn sau 10 phút
    };
    await user.save();

    // Gửi OTP qua SMS (cần triển khai)
    // Ví dụ: await sendSMS(newPhone, otp);
    console.log(`Gửi OTP ${otp} đến số điện thoại ${newPhone}`);

    res.json({ message: "OTP đã được gửi đến số điện thoại mới!" });
  } catch (error) {
    console.error("Lỗi khi gửi OTP thay đổi số điện thoại:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.verifyAndChangePhone = async (req, res) => {
  try {
    const { newPhone, otp } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    if (
      !user.otp ||
      user.otp.code !== otp ||
      user.otp.type !== "phone" ||
      user.otp.expires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
    }

    user.phone = newPhone;
    user.isPhoneVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({
      message: "Số điện thoại đã được thay đổi thành công!",
      phone: newPhone,
    });
  } catch (error) {
    console.error("Lỗi khi xác thực và thay đổi số điện thoại:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
