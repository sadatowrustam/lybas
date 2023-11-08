const express = require('express');
const { getAllMails, getMail } = require('../../../controllers/admin/mailController');
const router = express.Router();
router.get('/', getAllMails);
router.get('/:id', getMail);
module.exports = router;