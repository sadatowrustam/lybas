const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Products,
    Categories,
    Images,
    Productsizes,
    Material,
    Size,
    Seller
} = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllActiveProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    let where=getWhere(req.query)
    const filter=JSON.parse(req.query.filter)
    const endDate=new Date(filter.endDate)
    const startDate=new Date(filter.startDate)
    if(filter.startDate!=undefined){
        where.push({createdAt:{
            [Op.gte]: startDate,
            [Op.lte]: endDate 
            }
        })
    }
    where.push({sellerId:req.seller.id})
    
    const data = await Products.findAll({
        where,
        limit,
        offset,
        include: [{
                model: Images,
                as: "images",
                limit: 4
            },
            {
                model: Material,
                as: "material",
                
            },
            {
                model: Productsizes,
                as: "product_sizes"
            },
            {
                model:Seller,
                as:"seller"
            }
        ],
        order: [
            ['updatedAt', 'DESC'],
            // ["images", "id", "DESC"]
        ],
    });
    const count = await Products.count({where})
    return res.status(200).send({ data, count });
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const { id } = req.params
    const oneProduct = await Products.findOne({
        where: { id },
        include: [
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
function getWhere({ categoryId,sizeId,materialId,keyword,welayat}) { 
    let where = []
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where.push({
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
        });
    }
    if(sizeId && sizeId!="undefined"){
        where.push({sizeIds:{[Op.contains]:[sizeId]}})
    }
    if(categoryId &&categoryId!="undefined"){
        where.push({categoryId})
    }
    if(materialId && materialId!="undefined"){
        where.push({materialId})
    }
    if(welayat&&welayat!="undefined"){
        where.push({welayat})
    }
    return where
}