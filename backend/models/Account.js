const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  productCode: String, // relasi ke Product.code
  email: String,
  password: String,
  available: { type: Boolean, default: true },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
