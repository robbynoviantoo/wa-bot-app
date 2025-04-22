// Simpan order_id yang sedang berjalan untuk tiap user
const pendingOrders = new Map();

module.exports = {
  setOrder: (userId, orderId) => pendingOrders.set(userId, orderId),
  getOrder: (userId) => pendingOrders.get(userId),
  deleteOrder: (userId) => pendingOrders.delete(userId),
  hasOrder: (userId) => pendingOrders.has(userId),
};
