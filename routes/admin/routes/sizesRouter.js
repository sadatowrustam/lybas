const express = require('express');
const {
    addSize,
    editSize,
    deleteSize
} = require('../../../controllers/admin/sizesControllers');
const {
    getAllSizes,
} = require('../../../controllers/public/sizesControllers');
const router = express.Router();
router.get('/', getAllSizes);
router.post('/add', addSize);
router.patch('/:id', editSize);
router.post('/delete/:id', deleteSize);

module.exports = router;