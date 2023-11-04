const express = require('express');
const {getAllBlogs, addBlogs, editBlogs, deleteBlogs, uploadImages, deleteBlogsImage, uploadVideo} = require('../../../controllers/admin/blogsControllers');
const { getBlog }=require("../../../controllers/public/blogsController")
const router = express.Router();
router.get("/",getAllBlogs)
router.get("/:id",getBlog )
router.post('/add', addBlogs);
router.patch('/:id', editBlogs);
router.delete('/:id', deleteBlogs);
router.post("/upload-image/:id",uploadImages) 
module.exports = router;