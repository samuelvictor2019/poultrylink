const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.string().url().default('http://localhost:3000'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

    OTP_PROVIDER: z.enum(['console', 'termii']).default('console'),
    OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(10),

        RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
    RATE_LIMIT_MAX: z.coerce.number().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Imvalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

module.exports = parsed.data;