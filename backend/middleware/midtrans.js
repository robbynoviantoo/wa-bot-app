const midtransClient = require('midtrans-client');

// Konfigurasi Snap Midtrans
let snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true kalau live
  serverKey: 'SB-Mid-server-ivmAyTL37bYVzK87qArwslKP',
  clientKey: 'SB-Mid-client-inijo_DVKJ-sK82F'
});

module.exports = snap;
