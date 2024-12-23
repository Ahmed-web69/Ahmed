const mongoose = require("mongoose");
// make a schema
let productSchema = new mongoose.Schema({
  description: String,
  price: Number,
  quantity: Number,
  src: String,
  isFeatured: { type: Boolean, default: false },
  categoryId: String,
  sizes: {
    type: [String],
    enum: ['S', 'M', 'L'],
    default: ['M']
  }
});
//make a model
let Product = mongoose.model("Product", productSchema);
//export that model
module.exports = Product;