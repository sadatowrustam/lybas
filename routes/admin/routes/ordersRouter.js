const express = require('express');
const {
    getAllOrders,
    getOrderProducts,
    changeOrderStatus,
    deleteOrderProduct,
    deleteOrder,
    getStats,
} = require('../../../controllers/admin/ordersControllers');

const router = express.Router();

router.get('/', getAllOrders);
router.get("/stats",getStats)
router.delete('/order-products/delete/:id', deleteOrderProduct);
router.get('/order-products/:id', getOrderProducts);
router.patch('/status/:id', changeOrderStatus);

router.delete("/:id",deleteOrder)
module.exports = router;