const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/', messageController.saveMessage); // simpan pesan
router.get('/:groupId', messageController.getMessagesByGroup); // ambil pesan grup

module.exports = router;
