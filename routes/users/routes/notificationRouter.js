const express = require('express');
const { getAllNotifications, isRead } = require('../../../controllers/users/notificationController');
const router = express.Router();

router.get("/",getAllNotifications)
router.post("/isRead",isRead)
module.exports = router;