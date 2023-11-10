const { Mails } = require("../../models")
const catchAsync = require("../../utils/catchAsync")
const {Op}=require("sequelize")
exports.getAllMails = catchAsync(async(req, res, next) => {
    let { keyword} = req.query;
    var where = {};
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
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
                {
                    body_tm: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    body_ru: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    body_en: {
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
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0

    const count=await Mails.count({where})
    const data=await Mails.findAll({
        where,
        limit,
        offset,
        order:[["createdAt","DESC"]]
    })
    return res.send({data,count})
})
exports.getMail=catchAsync(async(req,res,next)=>{
    const mail=await Mails.findOne({where:{id:req.params.id}})
    return res.send({data:mail})
})