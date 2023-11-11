const fs = require('fs');
const sharp = require("sharp")
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {Op}=require("sequelize")
const {
    Comments,
    Images,
    Users
} = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllComments = catchAsync(async(req, res, next) => {
    let { keyword} = req.query;
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
                    text: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    name: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }
    if(req.query.filter){
        const filter=JSON.parse(req.query.filter)
        const endDate=new Date(filter.endDate)
        const startDate=new Date(filter.startDate)
        if(filter.startDate!=undefined){
            where.createdAt = {
                [Op.gte]: startDate,
                [Op.lte]: endDate 
            }
        }
    }
    const limit = req.query.limit || 20
    const offset = req.query.offset
    const data = await Comments.findAll({ 
        where, 
        limit, 
        offset,
        order:[["createdAt","DESC"]],
        include:[
            {
                model:Users,
                as:"user"
            },
                {
                    model:Images,
                    as:"images"
                }
            ] 
        })
    const count=await Comments.count({where})
    return res.status(200).send({data,count})
})
exports.editStatus=catchAsync(async(req,res,next)=>{
    console.log(req.body)
    const commment=await Comments.findOne({where:{id:req.body.id}})
    await commment.update({isActive:req.body.isActive})
    return res.send(commment)
})