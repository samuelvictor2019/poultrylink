const { prisma } = require('../config/dbHandler');
const logger = require('../utils/logger');


const orderRef = (orderId) => `#${orderId.slice(0, 8)}`;

async function notifyMany(notifications) {
    const rows = notifications.filter(n => n && n.userId);
    if (rows.length === 0) {
        return;
    }
    try {
        await prisma.notification.createMany({ data: rows });
    }
    catch (error) {
        logger.error('Failed to create notifications', { count: rows.length, error: error.message });
    }
}

const notify = (notification) => notifyMany([notification]);

async function findAdminIds() {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true }
    });
    return admins.map((a) => a.id);
}

// each builder receives { context } andd returns the notifications to send.
// `ctx.adminIds` loads admin recepients lazily so that we don't query the database if no notifications are sent.

const ORDER_EVENTS = {
    ORDER_PLACED: ({ orderId, ref, sellerId }) => [
        { userId: sellerId, orderId, type: 'ORDER', title: 'New order received', body: `Order ${ref} is waiting for your response.` },
    ],

    ORDER_ACCEPTED: ({ orderId, ref, buyerId }) => [
        { userId: buyerId, orderId, type: 'ORDER', title: 'Order accepted', body: `The seller accepted order ${ref}. Pay now to secure it.` },
    ],

    ORDER_REJECTED: ({ orderId, ref, buyerId }) => [
        { userId: buyerId, orderId, type: 'ORDER', title: 'Order declined', body: `The seller declined order ${ref}.` },
    ],

    ORDER_CANCELLED: ({ orderId, ref, sellerId, refunded }) => [
        {
            userId: sellerId,
            orderId,
            type: 'ORDER',
            title: 'Order cancelled',
            body: refunded
                ? `The buyer cancelled order ${ref}. The payment was refunded and your stock has been restored.`
                : `The buyer cancelled order ${ref}.`,
        }
    ],

    PAYMENT_CONFIRMED: ({ orderId, ref, buyerId, sellerId }) => [
        { userId: buyerId, orderId, type: 'PAYMENT', title: 'Payment received', body: `Your payment for order ${ref} is held safely in escrow` },
        { userId: sellerId, orderId, type: 'PAYMENT', title: 'Order paid', body: `Order ${ref} is paid and held in escrow. You can dispatch it now.` }
    ],

    PAYMENT_FAILED: ({ orderId, ref, buyerId }) => [
        { userId: buyerId, orderId, type: 'PAYMENT', title: 'Payment failed', body: `We couldn't confirm your payment for order ${ref}. You haven't been charged.` }
    ],

    ORDER_DISPATCHED: ({ orderId, ref, buyerId, transporterId }) => [
        { userId: buyerId, orderId, type: 'DELIVERY', title: 'Order on its way', body: `Order ${ref} has been dispatched.` },
        transporterId && {
            userId: transporterId,
            orderId,
            type: 'DELIVERY',
            title: 'New delivery assigned',
            body: `You've been assigned to deliver order ${ref}.`,
        },
    ],

    DELIVERY_DELIVERED: ({ orderId, ref, buyerId }) => [
        {
            userId: buyerId,
            orderId,
            type: 'DELIVERY',
            title: 'Order delivered',
            body: `Order ${ref} was marked delivered. Confirm receipt to release the payment to the seller.`,
        },
    ],

    DELIVERY_FAILED: ({ orderId, ref, buyerId, sellerId }) => [
        { userId: buyerId, orderId, type: 'DELIVERY', title: 'Delivery failed', body: `The delivery for order ${ref} could not be completed.` },
        { userId: sellerId, orderId, type: 'DELIVERY', title: 'Delivery failed', body: `The delivery for order ${ref} could not be completed.` },
    ],

    DELIVERY_CONFIRMED: ({ orderId, ref, buyerId, sellerId }) => [
        { userId: sellerId, orderId, type: 'ESCROW', title: 'Funds released', body: `Escrow for order ${ref} has been released to you.` },
        { userId: buyerId, orderId, type: 'REVIEW', title: 'Order complete', body: `Order ${ref} is complete. How did it go? Leave a review.` },
    ],

    DISPUTE_OPENED: async ({ orderId, ref, buyerId, sellerId, actorId, adminIds }) => {
        const counterpartyId = actorId === buyerId ? sellerId : buyerId;
        return [
            { userId: counterpartyId, orderId, type: 'ESCROW', title: 'Dispute opened', body: `A dispute was opened on order ${ref}. An admin will review it.` },
            ...(await adminIds()).map((userId) => ({
            userId,
            orderId,
            type: 'SYSTEM',
            title: 'Dispute needs review',
            body: `Order ${ref} is in dispute and waiting for a decision.`,
            })),
        ];
    },

    DISPUTE_RESOLVED: ({ orderId, ref, buyerId, sellerId, resolution }) => {
        const toSeller = resolution === 'RELEASE_TO_SELLER';
        const outcome = toSeller ? 'The funds were released to the seller.' : 'The funds were refunded to the buyer.';
        return [buyerId, sellerId].map((userId) => ({
            userId,
            orderId,
            type: 'ESCROW',
            title: 'Dispute resolved',
            body: `The dispute on order ${ref} was resolved. ${outcome}`,
        }));
    }
};

// sends the notifications for an order lifecycle event. looks up the order's parties itself so callers only need the order id

async function notifyOrderEvents(event, orderId, context = {} ) {
    try {
        const build = ORDER_EVENTS[event];
        if (!build) {
            throw new Error(`Unknown order event ${event}`);
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                buyerId: true,
                items: {
                    select: {
                        sellerId: true
                    },
                    take: 1
                }
            }
        });

        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        let cachedAdminIds;
        const notifications = await build({
            orderId,
            ref: orderRef(orderId),
            buyerId: order.buyerId,
            sellerId: order.items[0]?.sellerId,
            adminIds: async () => (cachedAdminIds ??= await findAdminIds()),
            ...context
        });
        await notifyMany(notifications);
    }
    catch (error) {
        logger.error('Failed to send order notifications', { event, orderId, error: error.message });
    }
}

// Keep the singular name used by order/payment callers while retaining the
// plural export for compatibility with any existing integrations.
module.exports = {
    notify,
    notifyMany,
    notifyOrderEvent: notifyOrderEvents,
    notifyOrderEvents,
    orderRef
};