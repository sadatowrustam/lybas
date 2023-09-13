const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Products,
    Categories,
    Subcategories,
    Images,
    Productsizes,
    Productcolor,
    Details
} = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllActiveProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    let { keyword, categoryId, subcategoryId } = req.query;
    var where = {};
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [{
                    name_tm: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    name_ru: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    where.sellerId = req.seller.id
    const products = await Products.findAll({
        where,
        limit,
        offset,
        include: {
            model: Images,
            as: "images",
            limit: 4
        },
        order: [
            ['id', 'DESC'],
            // ["images", "id", "DESC"]
        ],
    });
    const count = await Products.count()
    return res.status(200).send({ products, count });
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const { id } = req.params
    const oneProduct = await Products.findOne({
        where: { id },
        include: [{
                model: Productcolor,
                as: "product_colors",
                include: [{
                        model: Images,
                        as: "product_images"
                    },
                    {
                        model: Productsizes,
                        as: "product_sizes"

                    }
                ]
            },
            {
                model: Productsizes,
                as: "product_sizes"
            },
            {
                model: Images,
                as: "images"
            },
            {
                model: Categories,
                as: "category"
            },
        ]
    })
    return res.send(oneProduct)
})
exports.addProduct = catchAsync(async(req, res, next) => {
    console.log(req.seller)
    req.body.isActive = false
    // const date = new Date()
    // req.body.is_new_expire = date.getTime()
    req.body.stock = Number(req.body.stock)
    if (req.body.discount > 0) {
        req.body.price_old = req.body.price;
        req.body.price =(req.body.price_old / 100) *(100 - req.body.discount);
    }
    req.body.sellerId = req.seller.id
    const newProduct = await Products.create(req.body);
    return res.status(201).send(newProduct)
})