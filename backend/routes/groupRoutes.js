const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/register', groupController.registerGroup);

module.exports = router;
