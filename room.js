const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Kết nối MongoDB
const RoomCategory = require("./models/roomCategory"); // Model RoomCategory

dotenv.config(); // Load biến môi trường từ file .env

// Kết nối MongoDB
connectDB();

// Hàm kiểm tra danh mục phòng
const checkRoomCategories = async () => {
  try {
    const categories = await RoomCategory.find(); // Lấy tất cả danh mục phòng
    if (categories.length === 0) {
      console.log("🔹 Không có danh mục phòng nào!");
    } else {
      console.log("🔹 Các danh mục phòng hiện tại:");
      console.log(categories);
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra danh mục phòng:", err);
  } finally {
    // Đóng kết nối MongoDB sau khi kiểm tra
    mongoose.connection.close();
  }
};

// Chạy hàm kiểm tra danh mục
checkRoomCategories();
