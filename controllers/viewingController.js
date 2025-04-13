const Viewing = require("../models/Viewing"); // Mô hình lịch xem phòng
const RoomCategory = require("../models/roomCategory"); // Mô hình phòng
const { sendConfirmationEmail } = require("../utils/mailer");
exports.createViewing = async (req, res) => {
  try {
    console.log("Dữ liệu đầu vào:", req.body); // In đầu vào ra để kiểm tra

    const { roomId, customerName, customerEmail, customerPhone, viewDate } =
      req.body;
    if (!roomId) {
      return res.status(400).json({ message: "Phòng không được để trống" });
    }
    // Kiểm tra tính hợp lệ của ngày xem phòng
    const currentDate = new Date();
    const requestedDate = new Date(viewDate);

    // Kiểm tra xem ngày xem có phải là ngày trong tương lai không
    if (requestedDate <= currentDate) {
      return res
        .status(400)
        .json({ message: "Ngày xem phòng phải là ngày trong tương lai" });
    }

    // Kiểm tra định dạng viewDate
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Ngày xem phòng không hợp lệ" });
    }

    // Kiểm tra thông tin đầu vào
    if (
      !roomId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !viewDate
    ) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều phải được điền đầy đủ" });
    }

    // Kiểm tra phòng có tồn tại không
    const room = await RoomCategory.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Phòng không tồn tại" });
    }

    // Kiểm tra nếu có lịch xem phòng trùng với thời gian yêu cầu
    const existingViewing = await Viewing.findOne({
      roomId: roomId,
      viewDate: {
        $gte: new Date(viewDate).setHours(0, 0, 0, 0), // Bắt đầu từ đầu ngày
        $lt: new Date(viewDate).setHours(23, 59, 59, 999), // Kết thúc vào cuối ngày
      },
    });

    if (existingViewing) {
      return res
        .status(400)
        .json({ message: "Phòng đã có người đặt lịch xem vào thời gian này" });
    }

    // Tạo lịch xem phòng mới
    const viewing = new Viewing({
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      viewDate,
      status: "pending", // Mới tạo, chưa xác nhận
    });

    await viewing.save();

    // Gửi email xác nhận
    sendConfirmationEmail(customerEmail, { customerName, viewDate });

    res.status(201).json({ message: "Đặt lịch xem phòng thành công", viewing });
  } catch (error) {
    console.error("❌ Lỗi khi tạo lịch xem phòng:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
exports.getAllViewings = async (req, res) => {
  console.log("🔥 API getAllViewings được gọi");
  try {
    const viewings = await Viewing.find().populate("roomId");
    res.status(200).json(viewings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.updateViewing = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail, customerPhone, viewDate, status } =
      req.body;

    const updatedViewing = await Viewing.findByIdAndUpdate(
      id,
      { customerName, customerEmail, customerPhone, viewDate, status },
      { new: true }
    );

    if (!updatedViewing) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch xem phòng để cập nhật" });
    }

    res.status(200).json({ message: "Cập nhật thành công", updatedViewing });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.deleteViewing = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Viewing.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch xem phòng để xóa" });
    }

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
exports.getViewingById = async (req, res) => {
  try {
    const { id } = req.params;
    const viewing = await Viewing.findById(id).populate("roomId");

    if (!viewing) {
      return res.status(404).json({ message: "Không tìm thấy lịch xem phòng" });
    }

    res.status(200).json(viewing);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
