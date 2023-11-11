const express = require('express');
const { getAllMails, getMail,isRead } = require('../../../controllers/admin/mailController');
const router = express.Router();
router.get('/', getAllMails);
router.get("/isRead",isRead)
router.get('/:id', getMail);
module.exports = router;