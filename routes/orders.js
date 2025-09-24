const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/auth");

// Create new order (user only)
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can place orders" });
    }

    const order = new Order({
      user: req.user.id,
      products: req.body.products, // array of { product, quantity }
      paymentMethod: req.body.paymentMethod || "COD"
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my orders
router.get("/me", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin only)
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "username email").populate("products.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
