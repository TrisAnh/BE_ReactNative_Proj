const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User"); // Đường dẫn đến model User của bạn
const { login } = require("./controllers/authController"); // Đường dẫn đến file chứa hàm login

dotenv.config(); // Load biến môi trường từ file .env

// Kết nối MongoDB (chỉnh lại URI nếu cần)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Kết nối MongoDB thành công!");

    // Tạo dữ liệu giả để kiểm tra
    const emailTest = "test@gmail.com";
    const passwordTest = "123456";

    // Kiểm tra xem user đã tồn tại chưa
    let user = await User.findOne({ email: emailTest });

    if (!user) {
      console.log("🔹 User chưa tồn tại, tạo mới...");
      const hashedPassword = await bcrypt.hash(passwordTest, 10);
      user = await User.create({ email: emailTest, password: hashedPassword });
    } else {
      console.log("🔹 User đã tồn tại, dùng dữ liệu cũ.");
    }

    // Giả lập request và response
    const req = { body: { email: emailTest, password: passwordTest } };
    const res = {
      status: (statusCode) => ({
        json: (data) => console.log(`📩 Response (${statusCode}):`, data),
      }),
      json: (data) => console.log("📩 Response:", data),
    };

    // Gọi hàm login để kiểm tra
    console.log("🚀 Kiểm tra đăng nhập...");
    await login(req, res);

    // Đóng kết nối MongoDB sau khi kiểm tra
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
