const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  price: Number,
  stock: Number,
});

// Virtual untuk mengakses akun-akun yang terhubung ke Product
productSchema.virtual('accounts', {
  ref: 'Account',
  localField: 'code',
  foreignField: 'productCode',
  justOne: false,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
