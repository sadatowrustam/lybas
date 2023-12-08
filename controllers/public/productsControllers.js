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
    let order=[]
    let where=[]
    if(req.query.filter)
        where=getWhere(JSON.parse(req.query.filter),req.query.sort)
    order=getOrder(req.query)
    if(req.query.sort==4){
        where.push({discount:{[Op.gt]:0}})
    }
    if(req.query.sort==3){
        where.push({recommended:true})
    }
    where.push({isActive:true})
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
// Search
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.searchProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
    var order;
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
    });
    where = {
        [Op.or]: [{
                name: {
                    [Op.like]: {
                        [Op.any]: keywordsArray,
                    },
                },
            },
           
        ],
    }
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
                [Op.or]: [
                    { materialId: { [Op.eq]: oneProduct.materialId } },
                    { sellerId: { [Op.eq]: oneProduct.sellerId } },
                    { categoryId: { [Op.eq]: oneProduct.categoryId } }
                ]
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
    const count=await Products.count({where:{sellerId:oneProduct.sellerId}})
    const product = {
        oneProduct,
        recommendations,
        count
    }
    return res.send({ data:product })
})

function getWhere({ price,category,color,size,material,welayat},sort) { 
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
if (sort == 4) {
    where.push({discount:{[Op.gt]:0}})
}
if (sort == 3) {
    where.push({recommended:true})
}
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