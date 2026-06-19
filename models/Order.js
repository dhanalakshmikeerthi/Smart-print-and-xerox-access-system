const mongoose = require("mongoose");

const orderSchema =
  new mongoose.Schema({

    orderId: String,

    tokenNo: String,

    transactionId: String,

    paymentMethod: String,

    student: String,

    studentName: String,

    fileName: String,

    fileUrl: String,

    public_id: String,

    pages: Number,

    copies: Number,

    color: String,

    side: String,

    amount: Number,

    priority: Boolean,

    spiralBinding: {
      type: Boolean,
      default: false
    },

    emergencyAlert: {
      type: Boolean,
      default: false
    },

    pickupOtp: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      default: "Pending"
    }

  }, {
    timestamps: true
  });

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );