const express = require('express');
const { addNotification, deleteNotification ,getAllNotifications, editNotification} = require('../../../controllers/admin/notificationController');
const { getNotifications } = require('../../../controllers/users/usersControllers');
const router = express.Router();
router.get('/',getAllNotifications );
router.get("/:id",getNotifications)
router.post('/add',addNotification ); 
router.patch("/:id",editNotification)
router.post('/delete/:id',deleteNotification );
 

module.exports = router;