const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller, Products, Productsizes, Categories, Images,Sellercategory } = require('../../models');
const sharp=require("sharp")
const fs=require("fs")
const {Op}=require("sequelize")
const {v4}=require("uuid")
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.addSeller = catchAsync(async(req, res, next) => {
    let { password } = req.body
    console.log(req.body)
    req.body.password = await bcrypt.hash(password, 10)
    req.body.isActive = true
    let seller = await Seller.create(req.body)
    for(const categoryId of req.body.categoryIds){
        const cat=await Sellercategory.create({categoryId,sellerId:seller.id})
        console.log(cat)
    }
    return res.send(seller)
})
exports.isActive = catchAsync(async(req, res, next) => {
    let { isActive, id } = req.body
    let seller = await Seller.findOne({ where: { id } })
    if (!seller) {
        return next(new AppError("There is no seller with this id", 404))
    }
    await seller.update({ isActive })
    if(isActive==false){
        await Products.update({isActive:false},{where:{sellerId:id0}})
    }else if(isActive==true){
        await Products.update({isActive:true},{where:{sellerId:id,edited:false}})
    }
    return res.send(seller)
})
exports.allSellers = catchAsync(async(req, res, next) => {
    const filter=JSON.parse(req.query.filter)
    let {keyword,welayat}=req.query
    const {endDate,startDate}=filter
    var where = {};
    if(welayat && welayat!="undefined") where.welayat=welayat
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    email: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                }
            ],
        };
    }
    if(filter.startDate!=undefined){
        where.createdAt = {
            [Op.gte]: new Date(startDate),
            [Op.lte]: new Date(endDate) 
        }
    }
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0
    let data = await Seller.findAll({
        limit,
        offset,
        order: [
            ["createdAt", "DESC"]
        ],
        where
    })
    let count = await Seller.count({where})
    return res.send({ data, count })
})
exports.oneSeller = catchAsync(async(req, res, next) => {
    let id = req.params.id
    let seller = await Seller.findOne({
        where: { id },
        include: [{
            model:Categories,
            as:"category",
            attributes:{}
            }
        ]
    })
    return res.send(seller)
})
exports.updateSeller = catchAsync(async(req, res, next) => {
    const { name, welayat,email,phone_number,isActive,image} = req.body;
    console.log(req.body)
    if (!name|| !welayat)
        return next(new AppError('Invalid credentials', 400));

    const seller = await Seller.findOne({ where: { id: [req.params.id] } });
    await seller.update({
        name,
        isActive,
        image,
        welayat,
        email,
        phone_number
    });
    await Sellercategory.destroy({where:{sellerId:seller.id}})
    for(const categoryId of req.body.categoryIds){
        await Sellercategory.create({categoryId,sellerId:seller.id})
    }
    return res.send(seller)
});
exports.deleteSeller = catchAsync(async(req, res, next) => {
    const seller = await Seller.findOne({ where: { id: req.params.id }, include: { model: Products, as: "products" } })
    if (!seller) return next(new AppError("seller with that id not found", 404))
    for (const one_product of seller.products) {
        const product = await Products.findOne({
            where: { id: one_product.id },
            include: [
                {
                    model: Productsizes,
                    as: "product_sizes"
                },
            ]
        });
        if (!product) return next(new AppError("Product with that id not found", 404))
        if (product.product_sizes) {
            for (const size of product.product_sizes) {
                let product_size = await Productsizes.findOne({ where: { id: size.id } })
                await product_size.destroy()
            }
        }
        if (!product)
            return next(new AppError('Product did not found with that ID', 404));

        const images = await Images.findAll({ where: { productId: product.id } })
        for (const image of images) {
            fs.unlink(`static/${image.image}`, function(err) {
                if (err) throw err;
            })
            await image.destroy()
        }
        await product.destroy();
    }
    await seller.destroy()
    return res.send("Success")

})
exports.getStats=catchAsync(async(req, res, next) =>{
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    const secondDate=endDate()
    secondDate.setMonth(endDate.getMonth() -2 );
    const data = await Orders.findAll({
        where: {
            createdAt: {
            between: [startDate, endDate]
            }
        }
    });
    const data2 = await Orders.findAll({
        where: {
            createdAt: {
            between: [secondDate, startDate]
            }
        }
    });
    return res.send({data,data2})
})
exports.uploadImages=catchAsync(async(req,res,next)=>{
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    for (const images of req.files) {
        const image_id = v4()
        var image = `${image_id}.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().resize(500,500).toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        // await blogs.update({image})
    }
    return res.status(201).send(image);
})
exports.uploadSellerImage = catchAsync(async(req, res, next) => {
    req.files = Object.values(req.files)
    const image = `${req.seller.id}_seller.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().resize(500,500).toBuffer()
    await sharp(buffer).toFile(`static/${image}`);
    return res.status(201).send(image);
});
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}