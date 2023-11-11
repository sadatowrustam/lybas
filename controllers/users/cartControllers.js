const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Products, Orderproducts,  Productsizes, Images, Seller } = require('../../models');
const { Op } = require("sequelize")
exports.addMyCart = catchAsync(async(req, res, next) => {
    const { id, productsizeId, quantity } = req.body;
    console.log(req.body)
    let order_product=await Orderproducts.findOne({where:{productsizeId,userId:req.user.id,isOrdered:false}})
    if(!order_product){
        order_product=await Orderproducts.create()
    }
    var orderProductData = {}
    let product = await Products.findOne({
        where: { id },
        include: [
            { model: Images, as: "images" },
            { model: Seller, as: "seller" }
        ]
    })
    if (!product) return next(new AppError("Product not found with that id", 404))
    if (productsizeId) {
        let productsize = await Productsizes.findOne({
            where: { id:productsizeId },
        })
        if (!productsize) return next(new AppError("Size with that id not found"))
        orderProductData.price = product.price
        orderProductData.image = product.images[0].image
        orderProductData.productsizeId = productsize.id
        orderProductData.quantity = quantity
        orderProductData.total_price = quantity * product.price
        orderProductData.productId = product.id
        orderProductData.materialId= product.materialId
    }
    if (product.seller) orderProductData.sellerId = product.sellerId

    orderProductData.userId = req.user.id
    orderProductData.is_ordered = false
    
    await order_product.update(orderProductData)
    return res.status(201).send(order_product)
})
exports.updateProduct = catchAsync(async(req, res, next) => {
    const { quantity } = req.body
    const order_product = await Orderproducts.findOne({ where: { id: req.params.id } })
    if (!order_product) return next(new AppError("Order product with that id not found", 404))
    const product = await Products.findOne({ where: { id: order_product.productId } })
    if (!product) return next(new AppError("Product not found with that id not found", 404))
    var product_size = await Productsizes.findOne({ where: { id:order_product.productsizeId } })
    price = price.price
    await order_product.update({
        price,
        total_price: price * quantity,
        quantity: Number(quantity),
    })
    return res.status(200).send({ order_product })
})
exports.isOrdered = catchAsync(async(req, res, next) => {
    const { productsizeId } = req.query
    let where = {
        userId: req.user.id,
        productsizeId,
        isOrdered:false
    }
    const order_product = await Orderproducts.findOne({ where })
    let status = 0
    if (order_product) {
        status = 1
        const product_size=await Productsizes.findOne({where:{id:productsizeId}})
        const product=await Products.findOne({where:{id:product_size.productId}})
        order_product.price = product.price
        order_product.total_price = order_product.price * order_product.quantity
    }
    return res.status(200).send({ status, order_product })
})
exports.deleteProduct = catchAsync(async(req, res, next) => {
    const order_product = await Orderproducts.findOne({
        where: {
            [Op.and]: [{ id: req.params.id }]
        }
    })
    console.log(order_product)
    if (!order_product) return next(new AppError("Order product with that id not found", 404))
    await order_product.destroy()
    return res.status(200).send({ msg: "Success" })
})