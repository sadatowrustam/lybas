const express = require('express');
const {
    getAllOrders,
    getOrderProducts,
    changeOrderStatus,
    deleteOrderProduct,
    deleteOrder,
    getStats,
    getDailyStats,
    isRead
} = require('../../../controllers/admin/ordersControllers');

const router = express.Router();

router.get('/', getAllOrders);
router.get("/isRead",isRead)
// router.get("/stats",getStats)
router.get("/daily",getDailyStats)
router.delete('/order-products/delete/:id', deleteOrderProduct);
router.get('/order-products/:id', getOrderProducts);
router.patch('/status/:id', changeOrderStatus);
router.delete("/:id",deleteOrder)
module.exports = router;