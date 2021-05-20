const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "johndoestv4@gmail.com",
      pass: "19903005"
    }
});

async function sendMailVerify(token, email) {
    var mainOptions = {
        from: "perlC SHOP",
        to: email,
        subject: "Xác nhận tài khoản",
        text: "text ne",
        html: "<p>Mã xác nhận của bạn là:</p>" + token
    };

    let info = await transporter.sendMail(mainOptions);
    if (info) return true;
    return false;
}

module.exports = {
    sendMailVerify
}