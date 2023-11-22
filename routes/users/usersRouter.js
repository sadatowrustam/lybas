const express = require('express');
const {
    login,
    signup,
    forgotPassword,
    protect,
    verify_code,
    verify_code_forgotten,
    checkCode,
} = require('../../controllers/users/authController');
const { addMyCart, updateProduct, deleteProduct, isOrdered} = require('../../controllers/users/cartControllers');
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
    subscribeToNews,
    deliverAbroad, 
} = require('../../controllers/users/usersControllers');
const router = express.Router();
router.use("/products", protect, require("./routes/productsRouter"))
router.use("/address", protect, require("./routes/addressRouter"))
router.use("/seller", protect, require("./routes/sellerRouter"))
router.use("/my-orders", protect, require("./routes/ordersRouter"))
router.use("/comments",protect,require("./routes/commentRouter"))
router.use("/notifications",protect,require("./routes/notificationRouter"))
    // router.use("/competition", protect, require("./routes/"))
router.patch('/forgot-password', verify_code_forgotten, forgotPassword);
router.post("/check-code",checkCode)
router.post('/signup', verify_code, signup);
router.get("/get-me", protect, getMe)
router.post('/login', login);
router.get('/get-me', protect, getMe);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);
router.post("/upload-image", protect, uploadUserImage)
router.patch('/update-my-password', protect, updateMyPassword);
router.post("/to-my-cart", protect, addMyCart)
router.get("/is-ordered", protect, isOrdered)
router.patch("/my-cart/:id", protect, updateProduct)
router.get("/not-ordered", protect, getNotOrderedProducts)
router.post("/delete/not-ordered/:id", protect, deleteProduct)
router.get("/like", protect, getUsersLikedProducts)
router.post("/like", protect, likeProduct) 
router.post("/dislike",protect,dislikeProduct)
router.post("/newsletter",subscribeToNews)
router.post("/delivery",deliverAbroad)
module.exports = router;