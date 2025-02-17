const mongoose = require("mongoose");

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    icon: {
      type: String,
      default: "default-icon.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    roomType: {
      type: String,
      enum: ["Phòng đơn", "Phòng đôi", "Căn hộ", "Chung cư", "Phòng ghép"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomCategorySchema.index({ name: 1 });

const RoomCategory = mongoose.model("RoomCategory", roomCategorySchema);

module.exports = RoomCategory;
