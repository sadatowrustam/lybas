const express = require('express');
const {getAllBlogs, addBlogs, editBlogs, deleteBlogs, uploadImages, deleteImage, } = require('../../../controllers/admin/blogsControllers');
const { getBlog }=require("../../../controllers/public/blogsController")
const router = express.Router();
router.get("/",getAllBlogs)
router.get("/:id",getBlog )
router.post('/add', addBlogs);
router.patch('/:id', editBlogs);
router.post('/delete/:id', deleteBlogs);
router.post("/upload-image",uploadImages) 
router.post("/delete-image/:image",deleteImage)
module.exports = router;