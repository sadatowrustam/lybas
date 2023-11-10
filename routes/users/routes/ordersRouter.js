const express = require('express');
const router = express.Router();

const {
    addMyOrders,
    getMyOrders,
    deleteOrderedProduct,
    deleteAllOrderedProducts,
    addInstantOrder
} = require('../../../controllers/users/ordersControllers');

router.post('/add', addMyOrders);
router.post("/instant-order",addInstantOrder)
router.get('/', getMyOrders);
router.delete("/", deleteOrderedProduct)
router.delete("/all", deleteAllOrderedProducts)

module.exports = router