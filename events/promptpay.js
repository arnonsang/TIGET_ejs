const generatePayload = require('promptpay-qr') 
const qrcode = require('qrcode') 
const fs = require('fs') 
const path = require('path');

const mobileNumber = '096-882-5197' 
const IDCardNumber = '0-0000-00000-00-0'
const amount = 0;
const payload = generatePayload(mobileNumber, { amount }) //First parameter : mobileNumber || IDCardNumber
console.log(payload)

const options = { type: 'svg', color: { dark: '#003b6a', light: '#f7f8f7' } }
  qrcode.toString(payload, options, (err, svg) => {
    if (err) return reject(err)
    console.log(svg);
    fs.writeFileSync(path.join(__dirname+'/./qrCode/qr'+amount+'.svg'), svg);
  })
// Convert to SVG QR Code
// const options = { type: 'png', color: { dark: '#000', light: '#fff' } }
// qrcode.toString(payload, options, (err, png) => {
//     if (err) return console.log(err)
//     fs.writeFileSync('./qr'+amount+'.png', png);
//     console.log(png)
// });