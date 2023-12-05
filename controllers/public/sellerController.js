const { Op } = require('sequelize');
const {
    Products,
    Images,
    Seller,
    Categories,
    Productsizes,
    Sizes
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');


exports.getAll = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, welayat } = req.query;
    let where={}
    if(welayat && welayat!="") {
        welayat=welayat.split(",")
        where.welayat=welayat
    }
    let keywordsArray = [];
    if (keyword) {
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
    }
    const sellers = await Seller.findAll({
        order: [
            ["createdAt", "DESC"]
        ],
        limit,
        offset,
        where
    });
    return res.status(200).send({ sellers })
})
exports.sellerProduct = catchAsync(async(req, res, next) => {
    let id = req.params.id
    let where=[]
    if(req.query.sort)
        where=getWhere(JSON.parse(req.query.sort),req.query.sortBy)
    let order=getOrder(req.query)
    if(req.query.sortBy==4){
        where.push({discount:{[Op.gt]:0}})
    }
    if(req.query.sortBy==3){
        where.push({recommended:true})
    }
    where.push({isActive:true})
    order.push(["images","createdAt","ASC"])
    where.push({sellerId:id})
    const seller = await Seller.findOne({ where: { id },include:{model:Categories,as:"category"} })
    if (!seller) {
        return next(new AppError(`Seller with id ${id} not found`))
    }
    const product = await Products.findAndCountAll({
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
    // product = await isLiked(product)
    return res.send({ seller, product })
})
exports.sellerProductNew = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError(`Seller with id ${seller_id} not found`))
    }
    const product = await Products.findAndCountAll({
        where: { sellerId: seller.id, isActive: true,isNew:true },
        include: [{
            model: Images,
            as: "images",

        }]
    })
    // product = await isLiked(product)
    return res.send({ seller, product })
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
            [Op.in]: welayat
          }
        })
    }
    return where
}
function getOrder({sortBy}){
    let order=[]
    if (sortBy == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sortBy == 0) {
        order = [
            ['price', 'ASC']
        ];
    
    }else if(sortBy==2){
        order=[["likeCount","DESC"]]
    }else if(sortBy==4){
        order=[["discount","DESC"]]
    }
    else order = [
        ['createdAt', 'DESC']
    ];
    return order
}