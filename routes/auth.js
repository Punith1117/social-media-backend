const express = require('express');
const { signup, login } = require('../controllers/authController');
const loginRateLimit = require('../middleware/loginRateLimit');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', loginRateLimit, login);

module.exports = router;
