const express = require('express');
const { getBlog }=require("../../../controllers/public/blogsController")
const { getAllBlogs }=require("../../../controllers/admin/blogsControllers")

const router = express.Router();
router.get("/",getAllBlogs)
router.get("/:id", getBlog)
module.exports = router;