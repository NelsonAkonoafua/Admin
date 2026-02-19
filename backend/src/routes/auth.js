const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, authController.login);

router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', body('email').isEmail(), validate, authController.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], validate, authController.resetPassword);
router.post('/verify-email', body('token').notEmpty(), validate, authController.verifyEmail);
router.put('/update-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], validate, authController.updatePassword);

module.exports = router;
