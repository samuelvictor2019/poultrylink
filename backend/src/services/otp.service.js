const crypto = require('crypto');
const { prisma } = require('../config/dbHandler');
const env = require('../config/env');
const logger = require('../utils/logger.js');

function generateCode() {
    return crypto.randomInt(100000, 999999).toString();
}

async function deliverOtp(user, code, purpose) {
    if (env.OTP_PROVIDER === 'console') {
        logger.info(`[OTP STUB] ${purpose} code for ${user.email} (${user.phone || 'no phone'}): ${code}`);
        return;
    }

    throw new Error(`Unsupported OTP_PROVIDER: ${env.OTP_PROVIDER}`);
}

async function createAndSendOtp(userId, purpose) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const code = generateCode();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    await prisma.otp.create({
        data: { userId, code, purpose, expiresAt }
    });

    await deliverOtp(user, code, purpose);
    return { expiresAt };
}

async function verifyOtp(userId, code, purpose) {
    const otp = await prisma.otp.findFirst({
        where: { userId, purpose, consumedAt: null },
        orderBy: { createdAt: 'desc' }
    });

    if (!otp) return { valid: false, reason: 'No pending OTP for this purpose' };
    if (otp.expiresAt < new Date()) return { valid: false, reason: 'OTP expired' };
    if (otp.code !== code) return { valid: false, reason: 'Incorrect OTP' };

    await prisma.otp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
    return { valid: true };
}

module.exports = { createAndSendOtp, verifyOtp};