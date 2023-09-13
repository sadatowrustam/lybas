const express = require('express');
const {
    login,
    signup,
    forgotPassword,
    protect,
    verify_code,
    verify_code_forgotten,
} = require('../../controllers/users/authController');
const { getMyCart, addMyCart, select, updateProduct, deleteProduct, isOrdered, deleteSelected, selectAll } = require('../../controllers/users/cartControllers');
const { getNotOrderedProducts, } = require('../../controllers/users/ordersControllers');
const {
    getMe,
    updateMyPassword,
    updateMe,
    deleteMe,
    likeProduct,
    dislikeProduct,
    getUsersLikedProducts,
    uploadUserImage,
    createCard,
} = require('../../controllers/users/usersControllers');
const router = express.Router();
router.use("/products", protect, require("./routes/productsRouter"))
router.use("/address", protect, require("./routes/addressRouter"))
router.use("/seller", protect, require("./routes/sellerRouter"))
router.use("/my-orders", protect, require("./routes/ordersRouter"))
router.use("/comments",protect,require("./routes/commentRouter"))
    // router.use("/competition", protect, require("./routes/"))
router.patch('/forgot-password', verify_code_forgotten, forgotPassword);
router.post('/signup', verify_code, signup);
router.get("/get-me", protect, getMe)
router.post('/login', login);
router.get('/get-me', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);
router.post("/upload-image", protect, uploadUserImage)
router.patch('/update-my-password', protect, updateMyPassword);
router.get('/my-cart', protect, getMyCart);
router.post("/to-my-cart", protect, addMyCart)
router.get("/is-ordered", protect, isOrdered)
router.patch("/my-cart/select/all", protect,selectAll)
router.patch("/my-cart/select/:id", protect, select)
router.patch("/my-cart/:id", protect, updateProduct)
router.get("/not-ordered", protect, getNotOrderedProducts)
router.delete("/not-ordered/:id", protect, deleteProduct)
router.delete("/not-ordered/multiple/", protect, deleteSelected)
router.get("/like", protect, getUsersLikedProducts)
router.post("/like", protect, likeProduct) 
module.exports = router;