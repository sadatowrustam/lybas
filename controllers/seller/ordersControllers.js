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
    const count = await Orders.count({ where }
)
    return res.status(201).send({ data, count });
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