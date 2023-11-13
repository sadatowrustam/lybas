const { Op, Sequelize } = require('sequelize');
const {
    Products,
    Productsizes,
    Images,
    Seller,
    Blogs,
    Sizes,
    Material,
    Colors,
    Comments,
    Users
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.getProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const { offset } = req.query;
    let where={}
    if(req.query.filter)
        where=getWhere(JSON.parse(req.query.filter))
    let order=getOrder(req.query)
    order.push(["images","createdAt","ASC"])
    const products = await Products.findAll({
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
        },
    ],
        where
    });
    return res.status(200).json(products);
});
exports.getTopProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, discount } = req.query
    let order, where = []
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
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    where.push({ isActive: true })
    order.push(["sold_count", "DESC"])
    if (isAction) where.isAction = isAction;
    const products = await Products.findAll({
        limit,
        offset,
        order,
        where,
        include: {
            model: Images,
            as: "images"
        },
    });
    return res.status(200).json(products);
});
exports.getLikedProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, discount, sex } = req.query
    let order, where = []
    where.push({ isActive: true })

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
        where.push(array)
    }
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    order.push(["likeCount", "DESC"])
    if (isAction) where.isAction = isAction
    const products = await Products.findAll({
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
    return res.status(200).json(products);
});
// Search
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.searchProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
    var order;
    // if (sort == 1) {
    //     order = [
    //         ['price', 'DESC']
    //     ];
    // } else if (sort == 0) {
    //     order = [
    //         ['price', 'ASC']
    //     ];
    // } else order = [
    //     ['updatedAt', 'DESC']
    // ];

    let keywordsArray = [];
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    let where = {
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
            {
                name_en: {
                    [Op.like]: {
                        [Op.any]: keywordsArray,
                    },
                },
            },
        ],
    }

    const products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include:[
            {
                model:Images,
                as:"images"
            }
        ]
    });
    delete where.isActive

    const seller = await Seller.findAll({
        where,
        order,
        limit,
        offset
    })
    where = {
        [Op.or]: [{
                header_tm: {
                    [Op.like]: {
                        [Op.any]: keywordsArray,
                    },
                },
            },
            {
                header_ru: {
                    [Op.like]: {
                        [Op.any]: keywordsArray,
                    },
                },
            },
            {
                header_en: {
                    [Op.like]: {
                        [Op.any]: keywordsArray,
                    },
                },
            },
        ],
    };
    const blogs=await Blogs.findAll({where}) 
    return res.status(200).send({ products, blogs, seller });
});
exports.searchLite = catchAsync(async(req, res, next) => {
    let { keyword } = req.query
    let keyword2=keyword
    let keywordsArray = [];
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    let where = {
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
    }
    const products = await Products.findAll({
        where,
        offset:0,
    });
    delete where.isActive
    const subcategories = await Subcategories.findAll({
        where,
        offset:0
    })
    const sellers = await Seller.findAll({
        where,
        offset:0
    })
    let names=[]
    for(const product of products){
        console.log(product.name_tm,product.name_ru,keyword2)
        if(product.name_tm.includes(keyword2) || product.name_tm.includes(capitalize(keyword2))){
            names.push(product.name_tm)
        }else {
            names.push(product.name_ru)
        }
}
    for(const subcategory of subcategories){
        if(subcategory.name_tm.includes(keyword2) || subcategory.name_tm.includes(capitalize(keyword2))){
            names.push(subcategory.name_tm)
        }else {
            names.push(subcategory.name_ru)
        }
    }
    for(const seller of sellers){
        if(seller.name_tm.includes(keyword2) || seller.name_tm.includes(capitalize(keyword2))){
            names.push(seller.name_tm)
        }else {
            names.push(seller.name_ru)
        }
    }
    console.log(names)
    return res.status(200).send(names);
})
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const id = req.params.id
    const oneProduct = await Products.findOne({
        where: { id },
        order:[["images","createdAt","ASC"]],
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
                as:"comments",
                include:[{
                    model:Users,
                    as:"user"
                },
                {
                    model:Images,
                    as:"images"
                }
            ]
            },
        ]
    })
    if (!oneProduct) {
        return next(new AppError("Can't find product with that id"), 404);
    }
    const recommendations = await Products.findAll({
            where: {
                id: {
                    [Op.ne]: oneProduct.id
                },
                sellerId:oneProduct.sellerId
            },
            limit: 4,
            order: [
                ["createdAt", "DESC"],
                ["images","createdAt","ASC"]
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
    const product = {
        oneProduct,
        recommendations
    }
    return res.send({ data:product })
})
exports.discount = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, sex } = req.query
    let order, where = []
    where.push({ isActive: true })

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
    if (isAction) where.push({ isAction })
    where.push({ discount })
    console.log(where)
    order.push(["images", "id", "DESC"])
    const discount_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }],
    });

    return res.status(200).send({ discount_products })
})
exports.actionProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, max_price, min_price, discount, sex } = req.query
    let order, where = []
    where.push({ isActive: true })

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
        where.push(array)
    }
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
    const count = await Products.count(where)
    return res.status(200).send({ action_products, count })
})
exports.newProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, discount, sex } = req.query
    let order, where = []
    where.push({ isActive: true })

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
        where.push(array)
    }
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    where.push({ isNew: true })
    order.push(["images", "id", "DESC"])
    const new_products = await Products.findAll({
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
    return res.status(200).send({ new_products, count });
});
exports.setRating = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({ where: { product_id: req.params.id } })
    if (!product) {
        return next(new AppError("Product not found"), 404)
    }
    let rating = ((product.rating * product.rating_count) + req.body.rating) / (product.rating_count + 1)
    await product.update({ rating, rating_count: product.rating_count + 1 })
    return res.status(200).send({ product })
})

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