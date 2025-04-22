const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Route untuk melihat stok produk
router.get('/stock', paymentController.getStock);

// Route untuk membeli produk
router.post('/buy', paymentController.purchaseProduct);

// Route untuk menerima notifikasi pembayaran dari Midtrans
router.post('/verify', paymentController.verifyPayment);

router.post('/add-stock', paymentController.addStock); 

router.post('/add-product', paymentController.addProduct); 

router.post('/check', paymentController.checkPaymentStatus);

module.exports = router;
