const fs = require('fs');
const sharp = require('sharp');
const { v4 } = require("uuid")
const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { getDate } = require("../../utils/date")
const uuid = require("uuid")
const {
    Products,
    Categories,
    Subcategories,
    Stock,
    Brands,
    Images,
    Productsizes,
    Productcolor,
    Colors,
    Details
} = require('../../models');
const include = [{
        model: Stock,
        as: 'product_stock',
    },
    {
        model: Images,
        as: "images",
        order: [
            ["id", "DESC"]
        ]
    }
];

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
    const products = await Products.findAll({
        where,
        limit,
        offset,
        include: [{
                model: Images,
                as: "images",
                limit: 4
            },
            {
                model: Productcolor,
                as: "product_colors",
                limit: 1
            },
            {
                model: Productsizes,
                as: "product_sizes"
            }
        ],
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
                        as: "product_sizes",
                    }
                ]
            },
            {
                model: Productsizes,
                as: "product_sizes",
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
exports.addSize = catchAsync(async(req, res, next) => {
    var sizes = []
    const product = await Products.findOne({ where: { id: req.params.id } })
    await Productsizes.destroy({ where: { productId: product.id } })
    if (!product) return next(new AppError("Product with that id not found", 404))
    for (let i = 0; i < req.body.sizes.length; i++) {
        let data = {}
        data.price_old = null;
        if (req.body.sizes[i].discount > 0) {
            // data.discount = req.body.sizes[i].discount
            data.price_old = req.body.sizes[i].price
            req.body.sizes[i].price = (data.price_old / 100) * (100 - req.body.sizes[i].discount)
        }
        data.price = req.body.sizes[i].price
        data.sizeId = req.body.sizes[i].sizeId
        data.discount=req.body.sizes[i].discount
        data.productId = product.id
        data.stock = req.body.sizes[i].stock
        let product_size = await Productsizes.create(data)
        sizes.push(product_size)
    }
    return res.status(201).send(sizes)
})
exports.addProduct = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.body.category_id },
    });
    if (!category)
        return next(new AppError('Category did not found with that ID', 404));
    const date = new Date()
    req.body.is_new_expire = date.getTime()
    req.body.stock = Number(req.body.stock)
    req.body.categoryId = category.id;
    req.body.price_old=null
    if (Number(req.body.discount) > 0) {
        req.body.price_old = req.body.price;
        req.body.price =(req.body.price / 100) *(100 - req.body.discount);
    }
    const newProduct = await Products.create(req.body);
    return res.status(201).send(newProduct)
})
exports.editProduct = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({
        where: { id: req.params.id },
    });
    if (!product)
        return next(new AppError('Product did not found with that ID', 404));
    req.body.price_old=null
    if (req.body.discount > 0) {
        req.body.price_old = req.body.price;
        req.body.price =(req.body.price_old / 100) *(100 - req.body.discount);
    }
    await product.update(req.body);
    return res.status(200).send(product);
});
exports.editProductStatus = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({
        where: { product_id: req.params.id },
    });
    if (!product)
        return next(new AppError('Product did not found with that ID', 404));

    await product.update({
        isActive: req.body.isActive,
    });

    return res.status(200).send(product);
});

exports.deleteProduct = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const product = await Products.findOne({
        where: { id },
        include: [

            {
                model: Productsizes,
                as: "product_sizes"
            },
        ]
    });
    if (!product)
        return next(new AppError('Product did not found with that ID', 404));
    if (!product) return next(new AppError("Product with that id not found", 404))
    if (product.product_sizes) await Productsizes.destroy({where:{productId:product.id}})

    const images = await Images.findAll({ where: { productId: product.id } })
    for (const image of images) {
        fs.unlink(`static/${image.image}`, function(err) {
            if (err) console.log(err)
            
        })
    }
    await Images.destroy({ where: { productId: product.id } })
    await product.destroy();
    return res.status(200).send('Successfully Deleted');
});
exports.uploadProductImage = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const updateProduct = await Products.findOne({ where: { id } });
    let imagesArray = []
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    if (!updateProduct)
        return next(new AppError('Product did not found with that ID', 404));
    for (const images of req.files) {
        const image_id = v4()
        const image = `${image_id}_product.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        let newImage = await Images.create({ image, id:image_id, productId: updateProduct.id })
        imagesArray.push(newImage)
    }
    return res.status(201).send(imagesArray);
});


exports.deleteProductImage = catchAsync(async(req, res, next) => {
    const image = await Images.findOne({ where: { id: req.params.id } })

    fs.unlink(`static/${image.image}`, function(err) {
        if (err) throw err;
    })
    await image.destroy()
    return res.status(200).send({ msg: "Sucess" })

})
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}