const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Products, Orders, Orderproducts, Productsizes, Sizes, Material, Seller,Images,Notification } = require('../../models');
const { Op } = require("sequelize")
const axios=require("axios")
exports. addMyOrders = catchAsync(async(req, res, next) => {
    var {
        address,
        note,
        user_phone,
        name,surname
    } = req.body;
    // let checkedProducts = [];
    let total_price = 0;
    let total_quantity = 0;
    let where= {[Op.and]: [{ userId: req.user.id }, { isOrdered: false }]}
    let order_products = await Orderproducts.findAll({where,order:[["createdAt","DESC"]]})
    let orders_array = []
    if (order_products.length == 0) return next(new AppError("Nothing to order", 400))
    let new_array=[]
    order_products.sort((a, b) => a.sellerId - b.sellerId);
    for (let i=0;i<order_products.length;i++) {
        
        let filtered=order_products.filter((object) => object.sellerId === order_products[0].sellerId);
        let obj={
            sellerId:order_products[0].sellerId,
            order_products:filtered
        }
        new_array.push(obj)
        order_products.splice(0,filtered.length)
        if(order_products.length==0) break
        i=0
    }
    for (let i=0;i<new_array.length;i++){
        total_price=0
        total_quantity=0
        for (var j = 0; j < new_array[i].order_products.length; j++) {
            if (new_array[i].order_products[j].productsizeId != null) {
                var product_size = await Productsizes.findOne({ where: { id: new_array[i].order_products[j].productsizeId },include:{model:Sizes,as:"size"}})
            }
            var product = await Products.findOne({
                where: { id: new_array[i].order_products[j].productId },
            });
            if (product_size) {
                console.log("ine men")
                if (product_size.stock < new_array[i].order_products[j].quantity) {
                    new_array[i].order_products[j].quantity = product_size.stock
                }
                // checkedProducts.push(product_size);
                new_array[i].order_products[j].size=product_size.size.size
                new_array[i].order_products[j].total_price = product.price * new_array[i].order_products[j].quantity
            } else if (product) {
                if (product.stock < new_array[i].order_products[j].quantity) {
                    new_array[i].order_products[j].quantity = product.stock
                }
                new_array[i].order_products[j].total_price = product.price * new_array[i].order_products[j].quantity
                // checkedProducts.push(product);
            }
            total_quantity = total_quantity + new_array[i].order_products[j].quantity;
            total_price = total_price + new_array[i].order_products[j].total_price;
        }
        const order = await Orders.create({
            userId: req.user.id,
            total_price,
            address,
            user_name: name+" "+surname,
            user_phone,
            note,
            status: "waiting",
            total_quantity,
            address,
            sellerId:new_array[i].sellerId,
            isRead:false,
            sellerRead:false
        });
        orders_array.push(order)
        const user=await axios.get("http://localhost:5011/users/"+order.userId)
        const seller=await axios.get("http://localhost:5011/seller/"+product.sellerId)
        const io=req.app.get("socketio")
        io.to(user.data.socketId).emit('user-notification');
        let count=await Orders.count({where:{sellerRead:false,sellerId:product.sellerId}})
        io.to(seller.data.socketId).emit('seller-order',count);
        count=await Orders.count({where:{isRead:false}})
        io.emit("admin-order",count)


        for (var x = 0; x < new_array[i].order_products.length; x++) {
            await Orderproducts.update({
                orderId: order.id,
                quantity: new_array[i].order_products[x].quantity,
                price: new_array[i].order_products[x].price,
                total_price: new_array[i].order_products[x].total_price,
                size: new_array[i].order_products[x].size,
                isOrdered: true,
                status: "waiting"
            }, {
                where: {
                    id: new_array[i].order_products[x].id,
                    }
            });
        
    
        }
        const cut=order.id.slice(0,8)
        const notif=await Notification.create({userId:req.user.id,text:"#"+cut,type:"waiting"})
    }
    return res.status(200).json({
        status: 'Your orders accepted and will be delivered as soon as possible',
        data: {
            orders_array,
        },
    });
})
exports.addInstantOrder=catchAsync(async(req,res,next)=>{
    const { id, productsizeId, quantity,address,user_phone,note,name,surname } = req.body;
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
    let productsize = await Productsizes.findOne({where: { id:productsizeId },include:{model:Sizes,as:"size"}})
    if (!productsize) return next(new AppError("Size with that id not found"))
        orderProductData.price = product.price
        orderProductData.image = product.images[0].image
        orderProductData.productsizeId = productsize.id
        orderProductData.quantity = quantity
        orderProductData.total_price = quantity * product.price
        orderProductData.productId = product.id
        orderProductData.materialId= product.materialId
        console.log("sizesize",productsize.size)
        orderProductData.size= productsize.size.size
    
    if (product.seller) orderProductData.sellerId = product.sellerId

    orderProductData.userId = req.user.id
    orderProductData.isOrdered = true
    const order = await Orders.create({
        userId: req.user.id,
        sellerId:product.sellerId,
        total_price:orderProductData.total_price,
        address,
        user_name: name+" "+surname,
        user_phone,
        note,
        status: "waiting",
        total_quantity:orderProductData.quantity,
        isRead:false,
        sellerRead:false
    });
    orderProductData.orderId=order.id
    const user=await axios.get("http://localhost:5011/users/"+order.userId)
    const seller=await axios.get("http://localhost:5011/seller/"+product.sellerId)
    const io=req.app.get("socketio")
    if(user.status==200) io.to(user.data.socketId).emit('user-notification');
    let count=await Orders.count({where:{sellerRead:false,sellerId:product.sellerId}})
    if(seller.status===200) io.to(seller.data.socketId).emit('seller-order',count);
    count=await Orders.count({where:{isRead:false}})
    io.emit("admin-order",count)
    await order_product.update(orderProductData)
    const cut=order.id.slice(0,8)
    const notif=await Notification.create({userId:req.user.id,text:"#"+cut,type:"waiting"})
    return res.status(201).send(order_product)
})
exports.getMyOrders=catchAsync(async(req,res,next)=>{
    const order=await Orders.findAll({
        where:{userId:req.user.id},
        include:{
            model:Orderproducts,
            as:"order_products",
            where:{userId:req.user.id},
            order:[["createdAt","DESC"]],
            include:[
                {
                    model:Products,
                    as:"product"
                },
                {
                    model:Material,
                    as:"material"
                }
            ]
        },
        order:[["createdAt","DESC"]]
    }
)
    return res.send(order)
})
exports.getMyOrderProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const order = await Orders.findOne({
        where: { order_id: req.params.id },
        include: {
            model: Orderproducts,
            as: 'order_products',
            order: [
                ['updatedAt', 'DESC']
            ],
            limit,
            offset,
        },
    });

    if (!order)
        return next(new AppError(`Order did not found with that ID`, 404));

    let orderProducts = [];

    for (var i = 0; i < order.order_products.length; i++) {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { product_id: order.order_products[i].product_id },
            });

            if (!product)
                return next(
                    new AppError(`Product did not found with your ID : ${i} `, 404)
                );

            const {
                product_id,
                name_tm,
                name_ru,
            } = product;
            if (order.order_products.product_size_id) {
                var product_size = await Productsizes.findOne({ where: { product_size_id: order.order_products.product_size_id } })
            }
            const obj = {
                order_product_id: order.order_products.order_product_id,
                product_id,
                name_tm,
                name_ru,
                image: order.order_products[i].image,
                quantity: order.order_products[i].quantity,
                price: order.order_products[i].price,
                total_price: order.order_products[i].total_price,
            };
            if (product_size) obj.size = product_size.size
            orderProducts.push(obj);
        }
    }

    res.status(200).send({ orderProducts });
});
exports.getNotOrderedProducts = catchAsync(async(req, res, next) => {
    let where={}
    where.userId=req.user.id
    where.isOrdered=false
    const order_products = await Orderproducts.findAll({ where ,order:[["createdAt","DESC"]]})
    const checked_products = []
    for (var i = 0; i < order_products.length; i++) {
        const product = await Products.findOne({
            where: { id: order_products[i].productId },
            include:[{
                model:Productsizes,
                as:"product_sizes",
                include:{
                    model:Sizes,
                    as:"size"
                }
            },
            {
                model:Material,
                as:"material"
            },
            {
                model:Images,
                as:"images",
                limit:1
            }
        ],
        
        });
        if (!product) continue
        const {
            id,
            name_tm,
            name_ru,
            name_en,
            body_en,
            body_tm,
            body_ru,
            material
        } = product;
        if (order_products[i].productsizeId != null) {
            var product_size = await Productsizes.findOne({ where: { id: order_products[i].productsizeId },include:{model:Sizes,as:"size"} })
        }
        let obj = {
            orderproductId: order_products[i].id,
            productId:id,
            name_tm,
            name_ru,
            name_en,
            body_en,
            body_tm,
            body_ru,
            productsizeId:product_size.id,
            image: product.images[0].image,
            quantity: order_products[i].quantity,
            material,
        };
        if (product_size) {
            obj.size = product_size.size.size
            obj.price = product.price
            obj.price_old = product.price_old
            obj.total_price = product.price * order_products[i].quantity
        } else if (product) {
            obj.price = product.price
            obj.price_old = product.price_old
            obj.total_price = product.price * order_products[i].quantity
        }
        checked_products.push(obj);
    }
    return res.status(200).send({ data:checked_products})
})
exports.deleteOrderedProduct = catchAsync(async(req, res, next) => {
    const { id } = req.query
        const orderproduct = await Orderproducts.findOne({ where: { id } })
            await orderproduct.update({ userId: null })
    return res.status(200).send({ msg: "Success" })
})
exports.deleteAllOrderedProducts = catchAsync(async(req, res, next) => {
    const { status } = req.query
    let where = {}
    let order_status = {
        status: {
            [Op.ne]: "not"
        }
    }
    if (status) order_status = {
        [Op.and]: [{
                status: {
                    [Op.not]: "not"
                }
            },
            { status: status }
        ]
    }

    where = order_status
    where.userId = req.user.id
    console.log(where)
    const order_products = await Orderproducts.findAll({ where })
    for (const one_product of order_products) {
        for (const orderproduct_id of order_products) {
            const orderproduct = await Orderproducts.findOne({ where: { orderproduct_id: one_product.orderproduct_id } })
            await orderproduct.update({ userId: null })

        }
    }
    return res.status(200).send({ msg: "Success" })
})