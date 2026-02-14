const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers');
const { validateLogin, validateResendVerification, validateForgotPassword, validateResetPassword } = require('../../middlewares/validator');

router.post('/login', validateLogin, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', validateResendVerification, authController.resendVerificationEmail);

router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;