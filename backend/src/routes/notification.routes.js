const router = require('express').Router();
const controller = require('../controllers/notification.controller');
const validate = require('../middleware/validate.middleware');
const schema = require('../validators/notification.validator');
const { authenticate } = require('../middleware/auth.middleware');


router.use(authenticate);
router.get('/', validate(schema.listNotifications), controller.myNotifications);
router.get('/unread-count', controller.unreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', validate(schema.idParam), controller.markRead);

module.exports = router;