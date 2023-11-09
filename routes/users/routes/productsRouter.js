const express = require("express")
const router = express.Router()
const {
    searchProducts,
    getOneProduct,
    getProducts,
    addReminder
} = require('../../../controllers/users/productsControllers');
router.get("/", getProducts)
router.get('/search', searchProducts);
router.get("/:id", getOneProduct)
router.post("/reminder",addReminder)


module.exports = router