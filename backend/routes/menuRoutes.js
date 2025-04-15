const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Mengambil menu untuk grup
router.get('/groups', menuController.getGroups);  // Rute untuk mendapatkan daftar grup

router.get('/:groupWaId', menuController.getGroupMenu);  // Rute untuk mengambil menu berdasarkan groupWaId

// Menyimpan command ke dalam menu grup
router.post('/set', menuController.setMenu);

// Menghapus command dari menu grup
router.post('/remove', menuController.removeCommand);

// Menyediakan daftar grup


module.exports = router;
