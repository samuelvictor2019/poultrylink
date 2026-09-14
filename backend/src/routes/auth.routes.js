const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, validate(schema.register), controller.register);
router.post('/verify-otp', authLimiter, validate(schema.verifyOtp), controller.verifyRegistrationOtp);
router.post('/resend-otp', authLimiter, validate(schema.resendOtp), controller.resendOtp);
router.post('/login', authLimiter, validate(schema.login), controller.login);
router.post('/refresh-token', validate(schema.refreshToken), controller.refresh);
router.post('/logout', validate(schema.refreshToken), controller.logout);
router.post('/forgot-password', authLimiter, validate(schema.forgotPassword), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(schema.resetPassword), controller.resetPassword);
router.get('/me', authenticate, controller.me);

module.exports = router;