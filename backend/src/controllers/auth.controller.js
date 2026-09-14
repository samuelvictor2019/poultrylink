const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service.js');
const otpService = require('../services/otp.service');

const register = asyncHandler(async (req, res) => {
    const { user, otpExpiresAt } = await authService.registerUser(req.body);
    sendSuccess(res, {
        statusCode: 201,
        message: 'Registered. An OTP has been sent to verify this account',
        data: { user, otpExpiresAt }
    });
});

const verifyRegistrationOtp = asyncHandler(async (req, res) => {
    const { userId, code, purpose } = req.body;
    if (purpose !== 'REGISTRATION') {
        throw ApiError.badRequest('Only registration OTPs can be verified here');
    }
    const result = await authService.verifyRegistrationOtp(userId, code);
    sendSuccess(res, { message: 'Account verified', data: result });
})

const resendOtp = asyncHandler(async (req, res) => {
    const { userId, purpose } = req.body;
    if (purpose !== 'REGISTRATION') {
        throw ApiError.badRequest('Only registration OTPs can be resent here');
    }
    const { expiresAt } = await otpService.createAndSendOtp(userId, purpose);
    sendSuccess(res, { message: 'OTP resent', data: { otpExpiresAt: expiresAt } });
});

const login = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, { message: 'Login successful', data: result });
});

const refresh = asyncHandler(async (req, res) => {
    const result = await authService.rotateRefreshToken(req.body.refreshToken);
    sendSuccess(res, { message: 'Token refreshed', data: result });
});

const logout = asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, { message: 'Logged out' });
});

const forgotPassword = asyncHandler(async (req, res) => {
    await authService.requestPasswordReset(req.body.email);
    sendSuccess(res, { message: 'If that account exists, a reset code has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    sendSuccess(res, { message: 'Password reset successful' });
});

const me = asyncHandler(async (req, res) => {
    sendSuccess(res, { message: 'Current user', data: { user: req.user } });
});

module.exports = {
    register,
    verifyRegistrationOtp,
    resendOtp,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    me,
};