const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    auth: {
      user: process.env.USERNAMEMAILER,
      pass: process.env.PASSWORDMAILER
    }
});

async function sendMailVerify(token, email) {
    var mainOptions = {
        from: "FUNITURE SHOP",
        to: email,
        subject: "Xác nhận tài khoản",
        text: "text ne",
        html: "<p>Mã xác nhận của bạn là:</p>" + token
    };

    let info = await transporter.sendMail(mainOptions);
    if (info) return true;
    return false;
}

async function sendMailResetPassword(password, email) {
    var mainOptions = {
        from: "FUNITURE SHOP",
        to: email,
        subject: "Đặt lại mật khẩu",
        text: "text ne",
        html: "<p>Mật khẩu mới của bạn là:</p>" + password
    };

    let info = await transporter.sendMail(mainOptions);
    if (info) return true;
    return false;
}

module.exports = {
    sendMailVerify,
    sendMailResetPassword
}