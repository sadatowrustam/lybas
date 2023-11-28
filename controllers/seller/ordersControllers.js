const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Productsizes,
    Products,
    Orders,
    Orderproducts,
    Stock,
    Material,
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
    where.sellerId=req.seller.id
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
    const notRead=await Orders.count({where:{sellerId:req.seller.id,sellerRead:false}})
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
            order_id: req.params.id,
        },
        include: {
            model: Orderproducts,
            as: 'order_products',
        },
    });

    if (!order) {
        return next(new AppError('Order did not found with that ID', 404));
    }

    if (req.body.status == "delivered") {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { product_id: order.order_products[i].product_id },
            });
            const product_size = await Productsizes
            const stock = await Stock.findOne({ where: { productId: product.id } });
            await stock.update({
                stock_quantity: stock.stock_quantity - order.order_products[i].quantity,
            });
            await product.update({ sold_count: product.sold_count + order.order_products[i].quantity })
        }
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
exports.getStats=catchAsync(async(req, res, next) =>{
    let stats={
        balance:{},
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
    where.sellerId=req.seller.id
    where2.sellerId=req.seller.id
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
    //orders count
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
    return res.send(stats)
})
exports.getDailyStats=catchAsync(async(req,res,next)=>{
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    let where= {
        createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    }
    const data = await Orders.findAll({
        where,
        order:[["createdAt","ASC"]],
    });
    let income=[]
    for (let i=0;i<data.length;i++) {        
        let filtered=data.filter((object) => (object.createdAt.getMonth() === data[0].createdAt.getMonth()&& object.createdAt.getDate() === data[0].createdAt.getDate()));
        income.push(getSum(filtered))
        data.splice(0,filtered.length)
        if(data.length==0) break
        i=0
    }
    return res.send(income)
})
const getSum=(array)=>{
    let sum=0
    for (let i=0;i<array.length;i++){
        sum+=array[i].total_price
    }
    return sum
}
exports.isRead=catchAsync(async(req,res,next)=>{
    const unreadOrders=await Orders.findAll({
        where: {
            sellerRead:false,
            sellerId:req.seller.id
        }
      });
      console.log(unreadOrders)
      for (const order of unreadOrders) {
        order.sellerRead = true;
        await order.save();
      }
    return res.send("Sucess")
})
const percentageDifference=(firstNumber,secondNumber)=>{
    let percentageDifference = ((firstNumber - secondNumber) / secondNumber) * 100;
    if (percentageDifference === Infinity) {
        percentageDifference = firstNumber;
      }
    return percentageDifference
}