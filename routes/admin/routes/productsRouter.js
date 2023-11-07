const express = require('express');
const {
    addProduct,
    editProduct,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    getAllActiveProducts,
    getOneProduct,
    addSize,
    deleteProductImage
} = require('../../../controllers/admin/productsControllers');
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.patch('/:id', editProduct);
router.post('/isActive', editProductStatus);
router.post('/delete/:id', deleteProduct);
router.post('/upload-image/:id', uploadProductImage);
router.post("/delete/image/:id", deleteProductImage)
module.exports = router;
