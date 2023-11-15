const express = require('express');
const { getOneProduct, editProduct } = require('../../../controllers/admin/productsControllers');
const router = express.Router()
const { addSeller, isActive, allSellers, oneSeller, deleteSeller, getStats, updateSeller,uploadImages } = require("../../../controllers/admin/sellerControllers");
const { deleteImage } = require('../../../controllers/admin/blogsControllers');


router.post("/add", addSeller)
router.post("/isActive", isActive)
router.get("/", allSellers)
router.get("/stats",getStats)
router.get("/:id", oneSeller)
router.patch("/:id",updateSeller)
router.get("/product/:id", getOneProduct)
router.patch("/product/:id", editProduct)
router.post("/delete/:id", deleteSeller)
router.post("/upload-image",uploadImages)
router.post("/delete-image/:image",deleteImage)
module.exports = router;