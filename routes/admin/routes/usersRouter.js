const express = require("express")
const { getAllUsers, getStats } = require("../../../controllers/admin/usersController")
const router = express.Router()

router.get("/", getAllUsers)
router.get("/stats",getStats)
module.exports = router