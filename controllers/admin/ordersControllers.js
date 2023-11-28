const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const axios=require("axios")
const {
    Productsizes,
    Products,
    Orders,
    Orderproducts,
    Notification,
    Material,
    Users,
    Seller,
    Dayincome
} = require('../../models');

exports.getAllOrders = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { user_phone, status,keyword } = req.query;
    let offset = req.query.offset || 0
    var where = {};
    if(req.query.filter){
        const filter=JSON.parse(req.query.filter)
        const endDate=new Date(filter.endDate)
        const startDate=new Date(filter.startDate)
        if(filter.startDate!=undefined){
            where.createdAt = {
                [Op.gte]: startDate,
                [Op.lte]: endDate 
            }
        }
    }
    if (status) {
        where.status = status
    }
    if (keyword&&keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [{
                    user_phone: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    user_name: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }
    const data = await Orders.findAll({
        where,
        order: [
            ['createdAt', 'DESC']
        ],
        limit,
        offset,
        include:{
            model:Orderproducts,
            as:"order_products",
            limit:1,
            include:[{
                model:Products,
                as:"product",
            },
            {
                model:Material,
                as:"material",
            }]
            }
    });
    const count = await Orders.count({ where })
    const notRead=await Orders.count({where:{isRead:false}})
    return res.status(201).send({ data, count,notRead });
});
exports. getOrderProducts = catchAsync(async(req, res, next) => {
    const order = await Orders.findOne({
        where: { id: req.params.id },
        include:{
            model:Orderproducts,
            as:"order_products",
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
    });

    if (!order)
        return next(new AppError(`Order did not found with that ID`, 404));

    res.status(200).send(order);
});

exports.changeOrderStatus = catchAsync(async(req, res, next) => {
    const order = await Orders.findOne({
        where: {
            id: req.params.id,
        },
        include: {
            model: Orderproducts,
            as: 'order_products',
        },
    });
    if (!order) {
        return next(new AppError('Order did not found with that ID', 404));
    }
    const io=req.app.get("socketio")
    const user=await axios.get("http://localhost:5011/users/"+order.userId)
    if(req.body.status=="accepted"){
        io.to(user.data.socketId).emit('user-notification');
        const cut=order.id.slice(0,8)
        await Notification.create({type:"accepted",text:"#"+cut,userId:order.userId,isRead:false,name:"accepted",link:"http://localhost:3000/orders"})
    }
    if (req.body.status == "onTheWay") {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { id: order.order_products[i].productId },
            });
            const product_size = await Productsizes.findOne({where:{id:order.order_products[i].productsizeId}})
            console.log(i,product_size.stock,order.order_products[i].quantity)
            await product_size.update({stock:product_size.stock-order.order_products[i].quantity})
            await product.update({ sold_count: product.sold_count + order.order_products[i].quantity })
            await Notification.create({productId:product.id,type:"rate",text:"You completed order of product please rate it",userId:order.userId,isRead:false,name:"order",link:"http://localhost:3000/orders"})
        }
        io.to(user.data.socketId).emit('user-notification');
    }
    await Orderproducts.update({ status: req.body.status }, { where: { orderId: order.id } })
    await order.update({
        status: req.body.status,
    });
    return res.status(201).send(order);
});

exports.deleteOrderProduct = catchAsync(async(req, res, next) => {
    const orderproduct = await Orderproducts.findOne({
        where: { orderproduct_id: req.params.id },
    });
    if (!orderproduct) {
        return next(new AppError('Order Product did not found with that ID', 404));
    }
    const order = await Orders.findOne({ where: { id: orderproduct.orderId } });

    await order.update({
        total_price: order.total_price - orderproduct.total_price,
    });

    await orderproduct.destroy();

    return res.status(200).json({ msg: 'Successfully Deleted' });
});
exports.deleteOrder=catchAsync(async(req, res, next) => {
    const order=await Orders.findOne({ where: { order_id: req.params.id}})
    await Orderproducts.destroy({where:{orderId:order.id}})
    await order.destroy()
    return res.send("sucess")
});
exports.getStats=catchAsync(async(req, res, next) =>{
    let stats={
        balance:{},
        users:{},
        seller:{},
        orders:{},

    }
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    const secondDate=new Date()
    secondDate.setMonth(secondDate.getMonth()-1)
    let where= {
        createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    }
    let where2= {
        createdAt: {
            [Op.gte]: secondDate,
            [Op.lte]: startDate
        },
    }
    //total balance
    let firstNumber = await Orders.sum("total_price",{
        where
    });

    let secondNumber = await Orders.sum("total_price",{
        where:where2
    });
    if (secondNumber === null) {
        secondNumber = 0;
    }
    let difference=percentageDifference(firstNumber,secondNumber)    
    stats.balance.sum=firstNumber
    stats.balance.difference=difference
    //users stats
     firstNumber = await Users.count({
        where
    });

     secondNumber = await Users.count({
        where:where2
    });
    if (secondNumber === null) {
        secondNumber = 0;
    }
    difference=percentageDifference(firstNumber,secondNumber)    
    stats.users.sum=firstNumber
    stats.users.difference=difference
    firstNumber = await Orders.count({
        where
    });

     secondNumber = await Orders.count({
        where:where2
    });
    if (secondNumber === null) {
        secondNumber = 0;
    }
    difference=percentageDifference(firstNumber,secondNumber)    
    stats.orders.sum=firstNumber
    stats.orders.difference=difference
    firstNumber = await Seller.count({
        where
    });

     secondNumber = await Seller.count({
        where:where2
    });
    if (secondNumber === null) {
        secondNumber = 0;
    }
    difference=percentageDifference(firstNumber,secondNumber)    
    stats.seller.sum=firstNumber
    stats.seller.difference=difference
    return res.send(stats)
})
exports.getDailyStats=catchAsync(async(req, res, next) =>{
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    let where= {
        createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    }
    const data = await Dayincome.findAll({
        where,
        order:[["createdAt","ASC"]],
        attributes:["createdAt","income"]
    });
    return res.send(data)
})
exports.isRead=catchAsync(async(req,res,next)=>{
    const unreadOrders=await Orders.findAll({
        where: {
          isRead: false,
        }
      });
      for (const order of unreadOrders) {
        order.isRead = true;
        await order.save();
      }
    return res.send("Sucess")
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
const percentageDifference=(firstNumber,secondNumber)=>{
    let percentageDifference = ((firstNumber - secondNumber) / secondNumber) * 100;
    if (percentageDifference === Infinity) {
        percentageDifference = firstNumber;
      }
    return percentageDifference
}