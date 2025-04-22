const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },
    code: String, // kode produk
    productCode: String, // tambahkan ini
    quantity: Number,
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }], // ganti nama
    status: {
      type: String,
      enum: ["pending", "settlement", "cancelled", "expire"],
      default: "pending",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
