const express = require("express")
const router = express.Router()

const {
    addMyComment,
    editMyComment,
    getComment,
    deleteMyComment,
    getAllComments
} = require("../../../controllers/users/commentController")

router.post("/", addMyComment)
router.get("/", getAllComments)
router.patch("/:id", editMyComment)
router.get("/:id", getComment)
router.delete("/:id", deleteMyComment)

module.exports = router