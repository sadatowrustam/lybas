const express = require('express');
const {
} = require('../../../controllers/admin/notificationController');
const { protect } = require("../../../controllers/admin/adminControllers")
const router = express.Router();
router.get('/', );
router.get('/:id', );
router.post('/add', );
router.patch("/:id", )
router.delete('/:id', );
router.post('/upload-image/:id', );

module.exports = router;