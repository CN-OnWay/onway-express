const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const dataController = require('./controllers/dataController');
const { authMiddleware } = require('./middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.post('/submits', dataController.handleSubmits);
router.post('/rates', dataController.handleRates);

router.get('/data', authMiddleware, dataController.getData);

module.exports = router;