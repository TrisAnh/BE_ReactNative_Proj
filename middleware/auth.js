const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Đảm bảo import model User

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET chưa được thiết lập!");
      return res
        .status(500)
        .json({ message: "Lỗi server, vui lòng thử lại sau!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong database để lấy đầy đủ thông tin
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    req.user = user; // Gán user vào req để dùng trong các API sau
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};
