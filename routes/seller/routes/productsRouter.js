const express = require('express');
const {
    addProduct,
    getAllActiveProducts,
} = require('../../../controllers/seller/productsControllers');
const {
    editProduct,
    deleteProductImage,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    addColor,
    addSize,
    getOneProduct,
} = require("../../../controllers/admin/productsControllers")
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:id",getOneProduct )
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.patch('/:id', editProduct);
router.patch('/edit-status/:id', editProductStatus);
router.post('/delete/:id', deleteProduct);
router.post("/isActive",editProductStatus)
router.post('/upload-image/:id', uploadProductImage);
router.post("/delete/image/:id", deleteProductImage)
module.exports = router;