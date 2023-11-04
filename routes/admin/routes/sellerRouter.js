const express = require('express');
const { getOneProduct, editProduct } = require('../../../controllers/admin/productsControllers');
const router = express.Router()
const { addSeller, isActive, allSellers, oneSeller, deleteSeller, getStats } = require("../../../controllers/admin/sellerControllers")

router.post("/add", addSeller)
router.post("/isActive", isActive)
router.get("/", allSellers)
router.get("/stats",getStats)
router.get("/:id", oneSeller)
router.get("/product/:id", getOneProduct)
router.patch("/product/:id", editProduct)
router.delete("/:id", deleteSeller)
module.exports = router;