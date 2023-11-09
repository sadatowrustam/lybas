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
    const count=await Products.count({where:{sellerId:oneProduct.sellerId}})
    const product = {
        oneProduct,
        recommendations,
        count
    }
    return res.send({ data:product })
})

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