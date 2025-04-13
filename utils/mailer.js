const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác nhận OTP",
    text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
  };

  await transporter.sendMail(mailOptions);
};
const sendConfirmationEmail = (email, viewingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Xác nhận lịch xem phòng",
    text: `Chào ${viewingDetails.customerName},\n\nChúng tôi đã nhận được yêu cầu đặt lịch xem phòng của bạn vào ngày ${viewingDetails.viewDate}. Chúng tôi sẽ liên lạc lại với bạn để xác nhận lịch xem.\n\nTrân trọng!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Lỗi khi gửi email xác nhận:", error);
    } else {
      console.log("Email xác nhận đã được gửi:", info.response);
    }
  });
};
module.exports = {
  sendOTP,
  sendConfirmationEmail,
};
