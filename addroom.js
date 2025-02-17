const mongoose = require("mongoose");
const RoomCategory = require("./models/roomCategory");

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

const addRoomCategories = async () => {
  try {
    const existingCategories = await RoomCategory.countDocuments({});
    if (existingCategories > 0) {
      console.log("✅ Dữ liệu đã tồn tại trong cơ sở dữ liệu.");
      return;
    }

    await RoomCategory.insertMany(roomCategories);
    console.log("✅ Dữ liệu danh mục phòng đã được thêm vào MongoDB!");
  } catch (error) {
    console.error("❌ Lỗi khi thêm dữ liệu vào MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
};

addRoomCategories();
