const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');

router.post('/', memoryController.setMemory);
router.get('/:groupWaId/:key', memoryController.getMemory);
router.get('/:groupWaId', memoryController.getAllMemory);

module.exports = router;
