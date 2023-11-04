const express = require('express');
const {
    addMaterial,
    editMaterial,
    deleteMaterial,
    getOneMaterial,
} = require('../../../controllers/admin/materialControllers');
const {
    getAllMaterials,
} = require('../../../controllers/public/materialsControllers');
const router = express.Router();
router.get('/', getAllMaterials);
router.get("/:id", getOneMaterial)
router.post('/add', addMaterial);
router.patch('/:id', editMaterial);
router.post('/delete/:id', deleteMaterial);

module.exports = router;