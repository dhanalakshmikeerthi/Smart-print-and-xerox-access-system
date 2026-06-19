const express = require("express");
const router = express.Router();

const Otp = require("../models/Otp");
const transporter = require("../config/mail");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
// SEND OTP
router.post("/send-otp", async (req, res) => {

  try {

    const { email } = req.body;

    const otp =
      Math.floor(
        100000 + Math.random() * 900000
      ).toString();

    await Otp.deleteMany({ email });

    await Otp.create({

      email,

      otp,

      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      )

    });

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Smart Print OTP",

      html: `
        <h2>Your OTP</h2>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
    });

    res.json({

      success: true,

      message: "OTP Sent Successfully"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Failed to send OTP"

    });

  }

});




// VERIFY OTP
router.post("/verify-otp", async (req, res) => {

  try {

    const { email, otp } = req.body;

    const record =
      await Otp.findOne({
        email,
        otp
      });

    if (!record) {

      return res.json({

        success: false,

        message: "Invalid OTP"

      });

    }

    if (new Date() > record.expiresAt) {

      return res.json({

        success: false,

        message: "OTP Expired"

      });

    }

    await Otp.deleteMany({ email });

    res.json({

      success: true,

      message: "OTP Verified"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }
});

  

router.post("/send-forgot-otp", async (req, res) => {

  try {

    const { email } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.json({
        success: false,
        message: "Email not found"
      });

    }

    const otp =
      Math.floor(
        100000 + Math.random() * 900000
      ).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt:
        new Date(
          Date.now() + 5 * 60 * 1000
        )
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP: ${otp}</h2>`
    });

    res.json({
      success: true,
      message: "OTP Sent"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});

router.post("/verify-forgot-otp", async (req, res) => {

  try {

    const { email, otp } = req.body;

    const record =
      await Otp.findOne({
        email,
        otp
      });

    if (!record) {

      return res.json({
        success: false,
        message: "Invalid OTP"
      });

    }

    if (new Date() > record.expiresAt) {

      return res.json({
        success: false,
        message: "OTP Expired"
      });

    }

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false
    });

  }

});

router.post(
"/reset-password",
async (req,res)=>{

 try{

  const {
   email,
   password
  } = req.body;

  const hashed =
   await bcrypt.hash(
    password,
    10
   );

  const user =
   await User.findOne({
    email
   });

  if(!user){

   return res.json({
    success:false,
    message:"User Not Found"
   });

  }

  user.password = hashed;

  await user.save();

  await Otp.deleteMany({
   email
  });

  res.json({
   success:true,
   message:"Password Updated"
  });

 }catch(error){

  console.log(error);

  res.status(500).json({
   success:false
  });

 }

});
module.exports = router;