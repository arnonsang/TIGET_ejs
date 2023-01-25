const nodemailer = require("nodemailer");
const path = require("path");


const generatePayload = require('promptpay-qr') 
const qrcode = require('qrcode') 
const fs = require('fs') 
// const path = require('path');

const mobileNumber = '096-882-5197' 
const IDCardNumber = '0-0000-00000-00-0'
const amount = 1850;
const payload = generatePayload(mobileNumber, { amount }) //First parameter : mobileNumber || IDCardNumber
console.log(payload)
let qr;
const options = { type: 'svg', color: { dark: '#003b6a', light: '#f7f8f7' } }
  qrcode.toString(payload, options, (err, svg) => {
    if (err) return reject(err)
    // console.log(svg);
    fs.writeFileSync(path.join(__dirname+'/./qrCode/qr'+amount+'111.svg'), svg);
    qr = svg;
  })



const mailer = (customerEmail, subject, html, price) => {

  
  // gmail account credentials
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "",
      pass: "",
    },
  });
  let mailOptions = {
    from: "hellotiget@hotmail.com", // sender
    to: customerEmail, // list of receivers
    subject: subject,
    attachments: [{
      filename: 'qr'+price+'.svg',
      path: path.join(__dirname+'/./qrCode/qr0.svg'),
      cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
 }], // Mail subject
    html: html+`<br><p>PromptPay QrCode : </p><br><img src="cid:logo">`, // HTML body
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log("Email sent: " + info.response);
  });
};

module.exports = {mailer};
