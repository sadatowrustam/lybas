const express = require('express')
const router = express.Router()
const { login, protect, updateMe, sendMe, getTime, changeTime,forgotPassword} = require("../../controllers/admin/adminControllers")
router.post("/login", login)
router.post("/edit", protect, updateMe)
router.get("/get-me", protect, sendMe)
router.get("/time", getTime)
router.post("/time", changeTime)
router.patch("/forgot-password", forgotPassword)
router.use("/banners", require("./routes/bannersRouter")) //test edildi
router.use("/blogs",require("./routes/blogsRouter"))
router.use("/colors",protect,require("./routes/colorRouter"))
router.use("/sizes",require("./routes/sizesRouter"))
router.use('/categories', require('./routes/categoriesRouter')); //delete test etmeli
router.use("/products", require("./routes/productsRouter")) //test etmeli
router.use("/orders", require("./routes/ordersRouter"))
router.use("/materials",require("./routes/materialRouter"))
router.use("/users", protect, require("./routes/usersRouter"))
router.use("/seller", require("./routes/sellerRouter")) 
router.use("/mails",require("./routes/mailRouter"))
module.exports = router