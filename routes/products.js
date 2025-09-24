const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorizeRoles } = require('../middleware/auth');

// Get all products (anyone)
router.get('/', async (req,res) => {
  const products = await Product.find();
  res.json(products);
});

// Search products by product name or seller username
router.get('/search', protect, async (req, res) => {
  const q = req.query.q;

  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "users",              // collection name for User model
          localField: "seller",       // field in Product
          foreignField: "_id",        // field in User
          as: "sellerData"
        }
      },
      { $unwind: "$sellerData" },
      {
        $match: {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { "sellerData.username": { $regex: q, $options: "i" } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          "sellerData.username": 1
        }
      }
    ]);

    res.json(products);
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
