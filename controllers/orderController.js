const Order = require("../models/Order");

const deleteCloudinaryFile = require(
  "../utils/deleteCloudinaryFile"
);

// CREATE ORDER
const createOrder = async (req, res) => {

  try {

    const {
      studentName,
      copies,
      pages,
      amount
    } = req.body;

    const newOrder = new Order({
      studentName,

      fileName: req.file.originalname,

      fileUrl: req.file.path,

      publicId: req.file.filename,

      resourceType:
        req.file.resource_type,

      copies,
      pages,
      amount
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order Created",
      order: newOrder
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL ORDERS
const getOrders = async (req, res) => {

  try {

    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (
  req,
  res
) => {

  try {

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    order.orderStatus = req.body.status;

    await order.save();

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// COMPLETE ORDER
const completeOrder = async (
  req,
  res
) => {

  try {

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // DELETE FILE FROM CLOUDINARY
    await deleteCloudinaryFile(
      order.publicId,
      order.resourceType
    );

    // DELETE ORDER FROM DATABASE
    await Order.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Order completed and removed"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  completeOrder
};