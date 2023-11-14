const express = require('express');
const {
    searchProducts,
    getOneProduct,
    getProducts,
    searchLite
} = require('../../../controllers/public/productsControllers');
const { getComments } = require('../../../controllers/users/productsControllers');

const router = express.Router();
router.get("/", getProducts)
router.get("/comments/:id",getComments)
router.get('/search', searchProducts);
// router.get("/search-lite", searchLite)
router.get("/:id", getOneProduct)

module.exports = router;