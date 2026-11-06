const { z } = require('zod');

const positiveInteger = z.string().regex(/^[1-9]\d*$/, 'Must be a positive integer');

const listNotifications = {
    query: z.object({
        page: positiveInteger.optional(),
        limit: positiveInteger.refine((value) => Number(value) <= 100, 'Must be at most 100').optional(),
        unread: z.enum(['true', 'false']).optional()
    })
};

const idParam = {
    params: z.object({ id: z.string().uuid() })
};

module.exports = { listNotifications, idParam };