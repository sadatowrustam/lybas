const { Op } = require('sequelize');
const {
    Products,
    Categories,
    Productsizes,
    Images,
    Sizes,
    Material,
    Instock,
    Likedproducts,
    Seller,
    Colors,
    Comments
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.getProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const { offset } = req.query;
    let where={}
    if(req.query.sort)
        where=getWhere(JSON.parse(req.query.sort))
    const order=getOrder(req.query)
    let products = await Products.findAll({
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, 
        {
            model:Productsizes,
            as:"product_sizes",
            include:{
                model:Sizes,
                as:"size"
            }
        }
    ],
        where
    });
    products=await isLiked(products,req)
    return res.status(200).json(products);
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const id = req.params.id
    let oneProduct = await Products.findOne({
        where: { id },
        include: [
            {
                model: Productsizes,
                as: "product_sizes",
                include:{
                    model:Sizes,
                    as:"size"
                }
            },
            {
                model: Images,
                as: "images"
            },
            {
                model: Seller,
                as: "seller"
            },
            {
                model:Material,
                as:"material"
            },
            {
                model:Colors,
                as:"color"
            },
            {
                model:Comments,
                as:"comments"
            }
        ]
    })
    if (!oneProduct) {
        return next(new AppError("Can't find product with that id"), 404);
    }
    let recommendations = await Products.findAll({
            where: {
                id: {
                    [Op.ne]: oneProduct.id
                },
                sellerId:oneProduct.sellerId
            },
            limit: 4,
            order: [
                ["createdAt", "DESC"]
            ],
            include: [
                {
                    model: Productsizes,
                    as: "product_sizes",
                    include:{
                        model:Sizes,
                        as:"size"
                    }
                },
                {
                    model: Images,
                    as: "images",
                },
            ]  
    })
    const liked_ids = await Likedproducts.findOne({
        where: {
            userId: req.user.id , productId: oneProduct.id
        }
    })
    if (liked_ids) oneProduct.isLiked = true
    recommendations=await isLiked(recommendations,req)
    const product = {
        oneProduct,
        recommendations
    }
    return res.send({ data:product })
})
exports.getTopProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.ofsset || 0
    const { isAction, discount, } = req.query;
    var order, where = {};
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    if (isAction) where.push({ isAction })
    order.push(["sold_count", "DESC"])
    let products = await Products.findAll({
        isActive: true,
        limit,
        offset,
        order,
        include: {
            model: Images,
            as: "images"
        },
    });
    products = await isLiked(products, req)

    return res.status(200).json(products);
});
exports.getLikedProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, discount } = req.query;
    var order, where = [];
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    if (isAction) where.push({ isAction })
    order.push(["likeCount", "DESC"])
    let products = await Products.findAll({
        isActive: true,
        order,
        limit,
        offset,
        where,
        include: {
            model: Images,
            as: "images"
        },
    });
    products = await isLiked(products, req)
    return res.status(200).send({ products })
});
// Search
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.searchProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
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

    let keywordsArray = [];
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    const products = await Products.findAll({
        where: {
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
            isActive: true,
        },
        order,
        limit,
        offset,
    });

    return res.status(200).send({ products });
});
exports.discount = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, sex } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    let discount = {
        [Op.ne]: 0
    }
    where.push({ discount })


    if (isAction) where.push({ isAction })
    let discount_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }],

    });
    discount_products = await isLiked(discount_products, req)
    const count = await Products.count({ where })
    return res.status(200).send({ discount_products, count })
})
exports.actionProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, discount } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    where.push({ isAction: true })

    let action_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, ]
    });
    const count = await Products.count({ where })
    action_products = await isLiked(action_products, req)
    return res.status(200).send({ action_products, count })
})
exports.newProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, discount, isAction } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) where.push({ isAction })
    where.push({ isNew: true })
    let new_products = await Products.findAll({
        where,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images",
        }],
        order,
    })
    new_products = await isLiked(new_products, req)
    const count = await Products.count({ where })
    return res.status(200).send({ new_products, count });
});
exports.getBrandProducts = catchAsync(async(req, res, next) => {
    const brand = await Brands.findOne({ where: { brand_id: req.params.id } });

    if (!brand)
        return next(new AppError('Brand did not found with that ID', 404));

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

    let products = await Products.findAll({
        where: { brandId: brand.id }, //isActive goy son
        order,
        limit,
        offset,
        include: [{
                model: Images,
                as: "images"
            },
            {
                model: Productsizes,
                as: "product_sizes"
            }
        ]
    });
    products = await isLiked(products, req)
    const count = await Products.count({ where: { brandId: brand.id } })
    return res.status(200).send({ products, count });
});
exports.getCategoryProducts = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.params.id },
    });

    if (!category)
        return next(new AppError('Category did not found with that ID', 404));

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
    let products = await Products.findAll({
        where: { categoryId: category.id }, //isActive goy sonundan
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    products = await isLiked(products, req)
    const count = await Products.count({ where: { categoryId: category.id } })
    return res.status(200).send({ products, count });
});
exports.getSubcategoryProducts = catchAsync(async(req, res, next) => {
    const subcategory = await Subcategories.findOne({
        where: { subcategory_id: req.params.id },
        include: {
            model: Categories,
            as: "category"
        }
    });
    if (!subcategory)
        return next(new AppError('Sub-category did not found with that ID', 404));
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const { is_new, max_price, min_price, sex, discount, sort } = req.query
    var order, where = {};
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    if (is_new == "true") {
        where.isNew = true
    }
    if (max_price && min_price == undefined) {
        where.price = {
            [Op.lte]: max_price
        }
    } else if (max_price == undefined && min_price) {
        where.price = {
            [Op.gte]: min_price
        }
    } else if (max_price && min_price) {
        where = {
            [Op.and]: [{
                    price: {
                        [Op.gte]: min_price
                    }
                },
                {
                    price: {
                        [Op.lte]: max_price
                    }
                }
            ]
        }
    }
    if (sex) {
        sex.split = (",")
        var array = []
        for (let i = 0; i < sex.length; i++) {
            array.push({
                sex: {
                    [Op.eq]: sex[i]
                }
            })
        }
        where = {
            [Op.or]: array
        }
    }
    if (discount && discount != "false") where.discount = {
        [Op.ne]: 0
    }
    where.subcategoryId = subcategory.id
    order.push(["images", "id", "DESC"])
    var products = await Products.findAll({
        where, //isActive goy
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where })
    products = await isLiked(products, req)
    return res.status(200).send({ products, count, subcategory });
});
exports.addReminder=catchAsync(async(req,res,next)=>{
    const data=await Instock.create(req.body)
    return res.status(200).send(data)
})
async function isLiked(products, req) {
    for (let i = 0; i < products.length; i++) {
        const liked_ids = await Likedproducts.findOne({
            where: {
                userId: req.user.id , productId: products[i].id
            }
        })
        if (liked_ids) products[i].isLiked = true
    }
    return products
}

function getWhere({ price,category,color,size,material,welayat}) { 
    let where = []
    let min_price,max_price
    if(price){
        min_price=price.min_price
        max_price=price.max_price
    }
    if (max_price && min_price == "") {
        let price = {
            [Op.lte]: max_price
        }

        where.push({ price })
    } else if (max_price == "" && min_price) {
        let price = {
            [Op.gte]: min_price
        }
        where.push({ price })

    } else if (max_price && min_price) {
        let price = {
            [Op.and]: [{
                    price: {
                        [Op.gte]: min_price
                    }
                },
                {
                    price: {
                        [Op.lte]: max_price
                    }
                }
            ],
        }
        where.push(price)
    }
    if(size && size.length>0){
        let array=[]
        for (let i=0;i<size.length;i++){
            array.push({sizeIds:{[Op.contains]:[size[i]]}})
        }
        let opor={[Op.or]:array}
        where.push(opor)
    }
    if(category&&category.length!=0){
        where.push({categoryId: {
            [Op.in]: category
          }
        })
    }
    if(color&&color.length!=0){
        where.push({colorId: {
            [Op.in]: color
          }
        })
    }
    if(material&&material.length!=0){
        where.push({materialId: {
            [Op.in]: material
          }
        })
    }
    if(welayat&&welayat.length!=0){
        where.push({welayat: {
            [Op.contains]: welayat
          }
        })
    }
    console.log(where)
    return where
}
function getOrder({sort}){
    let order=[]
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    
    }else if(sort==2){
        order=[["likeCount","DESC"]]
    }else if(sort==4){
        order=[["discount","DESC"]]
    }
    else order = [
        ['createdAt', 'DESC']
    ];
    return order
}