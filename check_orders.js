const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config();

const mongoUri = process.env.MONGO_URI;
console.log("Connecting to:", mongoUri);

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", orderSchema, "orders");

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    console.log("Last 10 orders:");
    orders.forEach((order, idx) => {
      console.log(`${idx + 1}. ID: ${order.orderId}, Token: ${order.tokenNo}, File Name: ${order.fileName}, File URL: ${order.fileUrl}, Status: ${order.status}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
