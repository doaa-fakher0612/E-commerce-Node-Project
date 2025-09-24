const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image:  { type: String, required: true }, // omg url
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', 
            required: true },
  sellerName: String //save seller name 
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
