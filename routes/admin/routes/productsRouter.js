const express = require('express');
const {
    addProduct,
    editProduct,
    uploadProductImage,
    deleteProduct,
    editProductStatus,
    getAllActiveProducts,
    getOneProduct,
    deleteProductImage,
    addSize
} = require('../../../controllers/admin/productsControllers');
const router = express.Router();

router.get('/', getAllActiveProducts);
router.get("/:id", getOneProduct)
router.post("/add", addProduct)
router.post("/add/size/:id", addSize)
router.patch('/:id', editProduct);
router.patch('/edit-status/:id', editProductStatus);
router.delete('/:id', deleteProduct);
router.post('/upload-image/:id', uploadProductImage);
router.delete("/image/:image", deleteProductImage)
module.exports = router;
