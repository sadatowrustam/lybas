const express = require('express');
const router=express.Router()
const { getAllComments, editStatus }=require("../../../controllers/seller/commentsController");
const { deleteMyComment, getComment } = require('../../../controllers/users/commentController');
router.get("/",getAllComments)
router.post("/isActive",editStatus)
router.post("/delete/:id",deleteMyComment)
router.get("/:id",getComment)
module.exports = router;