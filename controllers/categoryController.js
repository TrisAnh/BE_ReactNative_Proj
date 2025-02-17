const RoomCategory = require("../models/roomCategory");

exports.getAllRoomCategories = async (req, res) => {
  try {
    const roomCategories = await RoomCategory.find({ isActive: true }).sort(
      "order"
    );
    res.json(roomCategories);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách danh mục phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.getTopRatedRooms = async (req, res) => {
  try {
    const topRatedRooms = await RoomCategory.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(10);

    if (!topRatedRooms || topRatedRooms.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phòng nào được đánh giá!" });
    }
    const roomsInfo = topRatedRooms.map((room) => ({
      name: room.name,
      address: room.address,
      price: room.price,
      rating: room.rating,
      icon: room.icon,
    }));

    res.json(roomsInfo);
  } catch (error) {
    console.error("❌ Lỗi khi lấy phòng chạy nhất:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
