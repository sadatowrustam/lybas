const { Op } = require('sequelize');
const {
    Products,
    Images,
    Seller,
    Productsizes,
    Sizes
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');


exports.getAll = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
    let keywordsArray = [];
    if (keyword) {
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
    }
    const sellers = await Seller.findAll({
        order: [
            ["id", "DESC"]
        ],
        limit,
        offset,
    });
    return res.status(200).send({ sellers })
})
exports.sellerProduct = catchAsync(async(req, res, next) => {
    let id = req.params.id
    let where=[]
    if(req.query.filter)
        where=getWhere(JSON.parse(req.query.filter),req.query.sort)
    let order=getOrder(req.query)
    if(req.query.sort==4){
        where.push({discount:{[Op.gt]:0}})
    }
    if(req.query.sort==3){
        where.push({recommended:true})
    }
    where.push({isActive:true})
    order.push(["images","createdAt","ASC"])
    where.push({sellerId:id})
    const seller = await Seller.findOne({ where: { id },include:{model:Categories,as:"category"} })
    if (!seller) {
        return next(new AppError(`Seller with id ${id} not found`))
    }
    let product = await Products.findAndCountAll({
        where,
        include: [{
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
        },]
    })
    product = await isLiked(product,req)
    return res.send({ seller, product })
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
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
