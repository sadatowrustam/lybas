const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Banners, Seller } = require('../../models');
const {Op}=require("sequelize")
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllBanners = catchAsync(async(req, res) => {

    const filter=JSON.parse(req.query.filter)
    let keyword=req.query.keyword
    const {endDate,startDate}=filter
    console.log(keyword,endDate,startDate)
    var where = {};
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
                    link: {
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
    const data = await Banners.findAll({
        where,
        order: [
            ['updatedAt', 'DESC']
        ],
        limit,
        offset,
        include:{
            model:Seller,
            as:"seller"
        }
    });
    const count=await Banners.count({where})
    return res.status(200).send({ data,count});
});
exports.getBanner = catchAsync(async(req, res, next) => {
    const banner = await Banners.findOne({
        where: { id: req.params.id },
        include:{
            model:Seller,
            as:"seller"
        }
    });

    if (!banner)
        return next(new AppError('Banner did not found with that ID', 404));

    return res.status(200).send(banner);
});