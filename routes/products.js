const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorizeRoles } = require('../middleware/auth');

// Get all products (anyone)
router.get('/', async (req,res) => {
  const products = await Product.find();
  res.json(products);
});
router.get('/search', protect, async (req,res) => {
  const q = req.query.q;

  try {
    const products = await Product.find({
      // only filter by product name
      name: { $regex: q, $options: 'i' }
    }).populate("seller", "username");

    // additional filter by seller username
    const results = products.filter(p =>
      p.name.match(new RegExp(q, "i")) ||
      (p.seller && p.seller.username.match(new RegExp(q, "i")))
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (seller only)
router.post('/', protect, authorizeRoles('seller'), async (req,res) => {
  const { name, description, image, price } = req.body;
  const product = await Product.create({ 
    name, description, image, price, seller: req.user._id 
  });
  res.json(product);
});

// Update product (seller only his product)
router.put('/:id', protect, authorizeRoles('seller'), async (req,res) => {
  const product = await Product.findById(req.params.id);
  if(!product) return res.status(404).json({ message: 'product not exist '  });
  if(product.seller.toString() !== req.user._id.toString())
    return res.status(403).json({message: ' not  allowed to update '  });

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

// Delete product
router.delete('/:id', protect, authorizeRoles('seller'), async (req,res) => {
  const product = await Product.findById(req.params.id);
  if(!product) return res.status(404).json({ message: 'product not exist ' });
  if(product.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'not allowed to remove ' });

await product.deleteOne();
  res.json({ message: 'product removed successfully' });
});

module.exports = router;
