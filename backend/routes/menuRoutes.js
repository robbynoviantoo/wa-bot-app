const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Menyimpan command ke dalam menu grup
router.post('/', menuController.setMenu);

// Mengambil menu untuk grup
router.get('/:groupWaId', menuController.getMenu);

// Menghapus command dari menu grup
router.post('/remove', menuController.removeCommand);

module.exports = router;
