const { Mails } = require("../../models")
const AppError = require("../../utils/appError")
const catchAsync = require("../../utils/catchAsync")
exports.getAllMails = catchAsync(async(req, res, next) => {
    let where=getWhere(req.query)
    const limit=req.query.limit ||20
    const offset=req.query.offset || 0
    const data=await Mails.getAll({
        where,
        limit,
        offset
    })
    const count=await Mails.count({where})
    return res.send({data,count})
})
exports.getMail=catchAsync(async(req,res,next)=>{
    const mail=await Mails.findOne({where:{id:req.params.id}})
    return res.send({data:mail})
})

function getWhere({keyword,welayat}) { 
    let where = []
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where.push({
            [Op.or]: [{
                    phone_number: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                
            ],
        });
    }
    if(welayat&&welayat!="undefined"){
        where.push({welayat})
    }
    return where
}