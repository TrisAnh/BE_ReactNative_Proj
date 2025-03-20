const bcrypt = require("bcrypt");

const inputPassword = "12345678"; // Mật khẩu người dùng nhập vào
const storedHashedPassword =
  "$2b$10$I9sXaHCmPKSbBm4tEUJp6.0/mxAsYorlcm45c/mfwA9EVPu.udG2C"; // Mật khẩu trong database

async function checkPassword() {
  const isMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
  console.log("✅ Kết quả kiểm tra:", isMatch ? "Khớp" : "Không khớp");
}

checkPassword();
