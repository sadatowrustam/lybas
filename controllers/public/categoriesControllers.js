const {
    Categories,
    Products,
    Images
} = require('../../models');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.getAllCategories = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const categories = await Categories.findAll({
        limit,
        offset,
        order: [
            ['createdAt', 'ASC'],
        ],
    });
    const count=await Categories.count()
    return res.status(200).send({categories,count});
});

exports.getCategoryProducts = catchAsync(async(req, res, next) => {
    const id=req.params.id
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const sort = req.query.sort;

    var order;
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else order = [
        ['updatedAt', 'DESC']
    ];
    order.push(["images", "id", "DESC"])
    const products = await Products.findAll({
        where: { categoryId: id }, //isActive goy sonundan
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where: { categoryId: id } })
    return res.status(200).send({ products, count });
});