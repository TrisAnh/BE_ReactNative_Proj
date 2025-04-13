const RoomCategory = require("../models/roomCategory");

// 1️⃣ Lấy danh mục phòng
exports.getRoomCategories = async (req, res) => {
  try {
    const categories = await RoomCategory.distinct("roomType");
    res.json(categories);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh mục phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// 2️⃣ Lấy 10 phòng có rating cao nhất
exports.getTopRatedRooms = async (req, res) => {
  try {
    const topRooms = await RoomCategory.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(10)
      .select("name address price rating images");

    res.json(topRooms);
  } catch (error) {
    console.error("❌ Lỗi khi lấy phòng rating cao nhất:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.getRoomsByCategory = async (req, res) => {
  try {
    const { category } = req.params; // Nhận roomType từ URL
    // console.log("🔹 Loại phòng từ URL:", category);

    // Lọc danh sách phòng theo `roomType`
    const rooms = await RoomCategory.find({
      roomType: category, // roomType là chuỗi như "phòng đơn"
      isActive: true,
    })
      .sort({ order: 1 })
      .select("name address price rating images");

    if (!rooms.length) {
      return res
        .status(404)
        .json({ message: `Không có phòng thuộc loại: ${category}` });
    }

    res.json({ rooms });
  } catch (error) {
    console.error("❌ Lỗi khi lấy phòng theo loại:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
// API tìm kiếm & lọc phòng
exports.searchAndFilterRooms = async (req, res) => {
  try {
    let { keyword, roomType, minPrice, maxPrice, sortByPrice, page, limit } =
      req.query;

    let filter = { isActive: true }; // Chỉ lấy phòng đang hoạt động

    // Tìm kiếm theo tên phòng
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" }; // Không phân biệt hoa thường
    }

    // Lọc theo loại phòng
    if (roomType) {
      filter.roomType = roomType;
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sắp xếp theo giá (1: tăng dần, -1: giảm dần)
    let sort = {};
    if (sortByPrice) {
      sort.price = sortByPrice === "asc" ? 1 : -1;
    }

    // Phân trang
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    let skip = (page - 1) * limit;

    const rooms = await RoomCategory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("name address price rating images roomType");

    const totalRooms = await RoomCategory.countDocuments(filter);

    res.json({
      totalRooms,
      totalPages: Math.ceil(totalRooms / limit),
      currentPage: page,
      rooms,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm và lọc phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
// Lấy chi tiết phòng theo ID
exports.getRoomDetail = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const room = await RoomCategory.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng!" });
    }

    res.json(room);
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
