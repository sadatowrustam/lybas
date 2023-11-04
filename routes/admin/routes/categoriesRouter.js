const express = require('express');
const {
    addCategory,
    editCategory,
    deleteCategory,
    getOneCategory,
    addCategoryBrand,
    uploadCategoryImage
} = require('../../../controllers/admin/categoryControllers');
const {
    getAllCategories,
} = require('../../../controllers/public/categoriesControllers');
const router = express.Router();
router.get('/', getAllCategories);
router.get("/:id", getOneCategory)
router.post('/add', addCategory);
router.post("/upload-image/:id", uploadCategoryImage)
router.patch('/:id', editCategory);
router.post('/delete/:id', deleteCategory);

module.exports = router;