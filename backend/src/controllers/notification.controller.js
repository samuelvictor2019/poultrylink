const { prisma } = require('../config/dbHandler');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

const myNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { userId: req.user.id, ...(req.query.unread === 'true' && { isRead: false }) };
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ]);
  sendSuccess(res, { message: 'Notifications', data: notifications, meta: buildMeta({ page, limit, total }) });
});

// cheap enough to poll: a single indexed count, no rows transferred.
const unreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
  sendSuccess(res, { message: 'Unread notifications', data: { count } });
});

const markRead = asyncHandler(async (req, res) => {
  const { count } = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  // same answer for "doesn't exist" and "belongs to someone else", so ids can't be probed.
  if (count === 0) throw ApiError.notFound('Notification not found');
  sendSuccess(res, { message: 'Notification marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  sendSuccess(res, { message: 'All notifications marked as read' });
});

module.exports = { myNotifications, unreadCount, markRead, markAllRead };