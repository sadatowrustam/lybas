const express = require('express');
const {
    addProduct,
    getAllActiveProducts,
    getOneProduct,
} = require('../../../controllers/seller/productsControllers');
const {
    editProduct,
    deleteProductImage,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    addColor,
    addSize,
} = require("../../../controllers/admin/productsControllers")
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.patch('/:id', editProduct);
router.patch('/edit-status/:id', editProductStatus);
router.delete('/:id', deleteProduct);
router.post('/upload-image/:id', uploadProductImage);
router.delete("/image/:id", deleteProductImage)
module.exports = router;