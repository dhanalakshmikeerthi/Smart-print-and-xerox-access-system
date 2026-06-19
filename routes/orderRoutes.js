const express =
  require("express");

const router =
  express.Router();

const Order =
  require("../models/Order");

// SAVE ORDER

router.post("/", async (req, res) => {

  try {

    const order =
      await Order.create(req.body);

    res.json({
      success: true,
      order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        "Order Save Failed"
    });
  }
});

// GET ALL ORDERS

router.get("/", async (req, res) => {

  try {

    const orders =
      await Order.find().sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      success: false
    });
  }
});

router.get("/my-orders/:email", async (req, res) => {
  try {

    const orders = await Order.find({
      student: req.params.email
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

// PRINT COMPLETE (MARK AS READY AND GENERATE OTP)
router.put("/:id/ready", async (req, res) => {
  try {
    // Generate a secure 4-digit pickup OTP (e.g. 1000 to 9999)
    const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "Ready",
        pickupOtp: pickupOtp
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Try sending print completion email with OTP to the student
    if (order.student) {
      try {
        const transporter = require("../config/mail");
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: order.student,
          subject: `Your Print is Ready! - Token ${order.tokenNo}`,
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
              <h2 style="color: #2563eb; margin-top: 0; display: flex; align-items: center; gap: 8px;">🖨️ Smart Print Ready!</h2>
              <p>Hello <b>${order.studentName || 'Student'}</b>,</p>
              <p>Great news! Your print job has been printed and is ready for pickup.</p>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #cbd5e1; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e3a8a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Order Details</h3>
                <table style="width: 100%; font-size: 14px; border-spacing: 0 8px;">
                  <tr><td style="width: 140px; color: #64748b;"><b>Token Number:</b></td><td><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${order.tokenNo}</span></td></tr>
                  <tr><td style="color: #64748b;"><b>Secure Pickup OTP:</b></td><td><span style="background-color: #fef08a; color: #854d0e; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${pickupOtp}</span></td></tr>
                  <tr><td style="color: #64748b;"><b>Order ID:</b></td><td>#${order.orderId}</td></tr>
                  <tr><td style="color: #64748b;"><b>File Name:</b></td><td>${order.fileName}</td></tr>
                  <tr><td style="color: #64748b;"><b>Pages:</b></td><td>${order.pages}</td></tr>
                  <tr><td style="color: #64748b;"><b>Copies:</b></td><td>${order.copies}</td></tr>
                  <tr><td style="color: #64748b;"><b>Spiral Binding:</b></td><td>${order.spiralBinding ? "📚 Yes" : "No"}</td></tr>
                  <tr><td style="color: #64748b;"><b>Total Paid:</b></td><td><b>₹${order.amount}.00</b></td></tr>
                </table>
              </div>

              <p style="font-size: 15px;">Please visit the print counter and present your secure Pickup OTP (<b>${pickupOtp}</b>) or scan your QR code to collect your printed documents.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
              <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated notification from the Smart Print & Xerox Access System.</p>
            </div>
          `
        });
        console.log(`Print ready email sent successfully to ${order.student} with OTP: ${pickupOtp}`);
      } catch (mailError) {
        console.error("Failed to send order ready email:", mailError);
      }
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// HANDOVER PRINT (COMPLETE ORDER)
router.put("/:id/complete", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "Completed"
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// VERIFY PICKUP OTP BY ADMIN
router.post("/verify-pickup-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const order = await Order.findOne({
      status: "Ready",
      pickupOtp: otp.trim()
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired Pickup OTP. No pending print job matches this OTP."
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET SINGLE ORDER BY ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;