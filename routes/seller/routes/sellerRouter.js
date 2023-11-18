 const express = require('express');
 const {
     login,
     protect,
     verify_code_forgotten,
     forgotPassword,
     checkCode
 } = require('../../../controllers/seller/authController');
 const {
     getMe,
     updateMyPassword,
     updateMe,
     deleteMe,
     uploadSellerImage,
     newAccount
 } = require('../../../controllers/seller/usersControllers');
 const router = express.Router();
 router.post("/new-account",newAccount)
 router.patch('/forgot-password', verify_code_forgotten, forgotPassword);
 router.post("/check-code",checkCode)
 router.get('/get-me', protect, getMe);
 router.patch('/edit', protect, updateMe);
 router.delete('/delete-me', protect, deleteMe);
 router.patch('/password', protect, updateMyPassword);
 router.post("/upload-image", protect, uploadSellerImage);
 module.exports = router;