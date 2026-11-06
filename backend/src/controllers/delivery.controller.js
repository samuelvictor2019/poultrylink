const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { notifyOrderEvent } = require('../services/notification.service');

const updateStatus = asyncHandler(async (req, res) => {
    const delivery = await prisma.delivery.findUnique({ where: { orderId: req.params.orderId } });
    if (!delivery) throw ApiError.notFound('Delivery not found for this order');
    if (req.user.role !== 'ADMIN' && (!delivery.transporterId || delivery.transporterId !== req.user.id)) {
        throw ApiError.forbidden('You are not assigned to this delivery');
    }
    if (req.user.role !== 'ADMIN' && req.body.status === 'CONFIRMED') {
        throw ApiError.forbidden('Only the buyer or an admin can confirm delivery');
    }

    const statusChanged = delivery.status !== req.body.status;
    const updated = await prisma.delivery.update({
        where: { orderId: req.params.orderId },
        data: { status: req.body.status, ...(req.body.status === 'DELIVERED' && { confirmedAt: null }) }
    });

    if (statusChanged && req.body.status === 'DELIVERED') {
        await prisma.order.update({ where: { id: req.params.orderId }, data: { status: 'DELIVERED' } });
        await notifyOrderEvent('DELIVERY_DELIVERED', req.params.orderId);
    } else if (statusChanged && req.body.status === 'FAILED') {
        await notifyOrderEvent('DELIVERY_FAILED', req.params.orderId);
    }

    sendSuccess(res, { message: 'Delivery status updated', data: { delivery: updated } });
});

const myDeliveries = asyncHandler(async (req, res) => {
    const deliveries = await prisma.delivery.findMany({
        where: { transporterId: req.user.id },
        include: { order: { select: { id: true, status: true, deliveryAddress: true } } },
        orderBy: { createdAt: 'desc' }
    });
    sendSuccess(res, { message: 'Your deliveries', data: deliveries });
});

module.exports = { updateStatus, myDeliveries };