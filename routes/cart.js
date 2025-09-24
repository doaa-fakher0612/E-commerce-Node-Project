const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { protect } = require("../middleware/auth");

// Middleware: allow only user or admin
function allowUserOrAdmin(req, res, next) {
  if (req.user.role === "user" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Only users or admins can access carts" });
}

// Create a new cart (only user)
router.post("/", protect, allowUserOrAdmin, async (req, res) => {
  try {
    const cart = new Cart({
      user: req.user.id,
      products: req.body.products
    });
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my cart (only user)
router.get("/me", protect, allowUserOrAdmin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("products.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update cart (only owner or admin)
router.put("/:id", protect, allowUserOrAdmin, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (cart.user.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to update this cart" });
    }

    cart.products = req.body.products || cart.products;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete cart (only owner or admin)
router.delete("/:id", protect, allowUserOrAdmin, async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (cart.user.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to delete this cart" });
    }

    await cart.deleteOne();
    res.json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
