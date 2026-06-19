const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// Secret key for cryptographic signing of payments (stored in .env)


// 1. INITIATE PAYMENT SECURELY (Anti-tamper checkout session)
router.post("/checkout", async (req,res)=>{

  try{

    const { amount } = req.body;

    const options = {

      amount: amount * 100,

      currency: "INR",

      receipt:
        "receipt_" + Date.now()

    };

    const order =
      await razorpay.orders.create(
        options
      );

    res.json({

      success:true,

      order

    });

  }catch(error){

    console.log(error);

    res.status(500).json({

      success:false,

      message:"Razorpay Error"

    });

  }

});
//2.verify PAYMENT INTEGRITY AND SAVE TO DATABASE
router.post("/verify", async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id +
        "|" +
        razorpay_payment_id
      )
      .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment"
      });
    }

    // Save order in MongoDB
    const orderCount =
  await Order.countDocuments();

const tokenNo =
  "TKN" +
  String(orderCount + 1).padStart(3, "0");

const finalOrder = await Order.create({
  ...orderDetails,

  tokenNo,

  orderId:
    "ORD" +
    Date.now(),

  transactionId:
    razorpay_payment_id,

  paymentMethod:
    "Razorpay",

  status: "Pending"
});

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: finalOrder
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});
module.exports = router;
