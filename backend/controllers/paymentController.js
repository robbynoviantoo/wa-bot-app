const express = require("express");
const bwipjs = require("bwip-js");
const Product = require("../models/Product");
const Account = require("../models/Account");
const Order = require("../models/Order");
const snap = require("../middleware/midtrans"); // Midtrans configuration

const paymentController = {
  // Menampilkan daftar stok produk
  getStock: async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stock data" });
    }
  },

  // Tambah akun ke stok produk
  addStock: async (req, res) => {
    const { productCode, accounts } = req.body;

    if (!productCode || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({
        message:
          "Invalid request. Please provide productCode and accounts array.",
      });
    }

    try {
      const product = await Product.findOne({ code: productCode });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Buat entri akun-akun baru
      const newAccounts = accounts.map(({ email, password }) => ({
        productCode,
        email,
        password,
        available: true,
      }));

      await Account.insertMany(newAccounts);

      // Update stok di produk
      product.stock += newAccounts.length;
      await product.save();

      res.json({
        message: `${newAccounts.length} akun berhasil ditambahkan ke stok ${product.name}`,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to add stock", error: error.message });
    }
  },

  addProduct: async (req, res) => {
    const { name, code, price } = req.body;

    if (!name || !code || !price) {
      return res
        .status(400)
        .json({ message: "Please provide name, code, and price." });
    }

    try {
      const existing = await Product.findOne({ code });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Product code already exists." });
      }

      const product = new Product({ name, code, price, stock: 0 });
      await product.save();

      res.json({ message: "Product created successfully.", product });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to create product", error: error.message });
    }
  },

  checkPaymentStatus: async (req, res) => {
    const { order_id } = req.body;

    try {
      const statusResponse = await snap.transaction.status(order_id);
      res.json({ status: statusResponse });
    } catch (err) {
      console.error("Gagal cek status pembayaran:", err.message);
      res.status(500).json({ message: "Gagal cek status pembayaran" });
    }
  },

  purchaseProduct: async (req, res) => {
    const { code, quantity, name, email } = req.body;

    try {
      // Find product by code
      const product = await Product.findOne({ code });

      if (!product || product.stock < quantity) {
        return res
          .status(400)
          .json({ message: "Product not available or insufficient stock" });
      }

      // Find accounts that are available
      const availableAccounts = await Account.find({
        productCode: code,
        available: true,
      }).limit(quantity);

      if (availableAccounts.length < quantity) {
        return res
          .status(400)
          .json({ message: "Not enough available accounts" });
      }

      // Create a Midtrans transaction request
      const orderId = `ORDER-${Date.now()}`;
      const grossAmount = product.price * quantity;

      const paymentRequest = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: [
          {
            id: product.code,
            price: product.price,
            quantity,
            name: product.name,
          },
        ],
        customer_details: {
          first_name: name,
          email: email,
        },
      };

      const chargeResponse = await snap.createTransaction(paymentRequest);
      const redirectUrl = chargeResponse.redirect_url;

      // Mark the accounts as unavailable
      await Account.updateMany(
        { _id: { $in: availableAccounts.map((a) => a._id) } },
        { $set: { available: false, order_id: orderId } } // Menyimpan order_id pada akun
      );

      // Reduce product stock
      product.stock -= quantity;
      await product.save();

      await Order.create({
        order_id: orderId,
        code,
        productCode: code, // simpan agar bisa rollback stok
        quantity,
        accounts: availableAccounts.map((a) => a._id),
        status: "pending",
      });

      // Generate barcode for payment
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: "qrcode", // ✅ Gunakan QR Code
        text: redirectUrl,
        scale: 5, // QR Code butuh skala yang lebih besar
        includetext: false,
      });

      // Send response to the user with barcode and payment URL
      res.json({
        message: "Please complete the payment using the barcode",
        barcode: barcodeBuffer.toString("base64"),
        payment_url: redirectUrl,
        order_id: orderId,
        accounts_reserved: availableAccounts.map((a) => ({
          email: a.email,
          password: a.password,
        })),
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error processing purchase", error: error.message });
    }
  },

  verifyPayment: async (req, res) => {
    const { order_id } = req.body;

    try {
      const statusResponse = await snap.transaction.status(order_id);

      if (statusResponse.transaction_status === "capture") {
        res.json({ message: "Payment successful", status: statusResponse });
      } else {
        // Jika pembayaran gagal atau expired, akun bisa dikembalikan
        await Account.updateMany(
          { order_id: order_id, available: false },
          { $set: { available: true } }
        );

        // Mengembalikan stok produk yang terkait dengan order_id
        const order = await Order.findOne({ order_id });
        if (order) {
          const product = await Product.findOne({ code: order.code });
          if (product) {
            product.stock += order.quantity; // Menambah stok sesuai jumlah produk yang dibatalkan
            await product.save();
          }
        }

        res.json({ message: "Payment not successful", status: statusResponse });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error verifying payment", error: error.message });
    }
  },

  rollbackStockAndAccount: async (req, res) => {
    const { order_id } = req.body;
  
    if (!order_id) {
      return res.status(400).json({ message: "Missing order_id" });
    }
  
    try {
      // Ambil order dari database
      const order = await Order.findOne({ order_id });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Periksa status order jika null dan set ke expired
      if (!order.status || order.status === "null") {
        order.status = "expired"; // Jika status masih null, dianggap expired
        await order.save();
        console.log("🚩 Order status set to expired due to inactivity.");
      }
  
      if (order.status === "cancelled" || order.status === "expired") {
        return res
          .status(400)
          .json({ message: "Order already rolled back or expired" });
      }
  
      // 🚫 Batalkan transaksi di Midtrans jika masih aktif
      try {
        await snap.transaction.cancel(order.order_id);
        console.log("🛑 Midtrans transaction cancelled:", order.order_id);
      } catch (err) {
        console.warn("⚠️ Gagal membatalkan di Midtrans:", err.message);
      }
  
      // ✅ Kembalikan akun
      await Account.updateMany(
        { _id: { $in: order.accounts_reserved }, available: false },
        { $set: { available: true, order_id: null } }
      );
  
      // ✅ Kembalikan stok
      await Product.updateOne(
        { code: order.code },
        { $inc: { stock: order.quantity } }
      );
  
      // 🚩 Update status order
      order.status = "cancelled";
      await order.save();
  
      console.log("🔁 Mengembalikan akun:", order.accounts_reserved);
      console.log("📦 Mengembalikan stok untuk:", order.code);
  
      res.json({ message: "Rollback success" });
    } catch (error) {
      console.error("❌ Rollback error:", error.message);
      res
        .status(500)
        .json({ message: "Rollback failed", error: error.message });
    }
  }
  
  
};

module.exports = paymentController;
