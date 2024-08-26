const nodemailer = require("nodemailer");
const os = require('os');

// Get the network interfaces
const networkInterfaces = os.networkInterfaces();

// Function to get the Wi-Fi IPv4 address
function getWiFiIPAddress() {
    for (let interfaceName in networkInterfaces) {
        if (interfaceName.includes('Wi-Fi') || interfaceName.includes('wlan') || interfaceName.includes('en0')) {
            for (let interface of networkInterfaces[interfaceName]) {
                if (interface.family === 'IPv4' && !interface.internal) {
                    return interface.address;
                }
            }
        }
    }
    return 'localhost'; // Fallback to localhost if no external IPv4 address is found
}



module.exports.sendVerifyMail= async (userMailId,uid)=>{
   const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure:false,
    requireTLS:true,
    auth: {
        user: 'kanhiyadixit48@gmail.com',
        pass: 'panf fnhj rshp vvto'
    }
});

const ipAddress = getWiFiIPAddress();

const link=`http://${ipAddress}:5000/verify/${uid}`;
 const info = await transporter.sendMail({
    from: '"Mira" <maddison53@ethereal.email>', // sender address
    to: `${userMailId}`, // list of receivers
    subject: "verify mail Id", // Subject line
    text: "Hello From Mira", // plain text body
    html: `<div><b>Your OTP for for MIRA  </b></br><div> ${uid}</div><div>`, // html body
  });
}