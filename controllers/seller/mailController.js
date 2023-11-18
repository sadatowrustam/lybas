const { Mails } = require("../../models")
const catchAsync = require("../../utils/catchAsync")
const {Op}=require("sequelize")
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
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
            [Op.or]: [
                {
                    mail: {
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
    where.sellerId=req.seller.id
    if(req.query.type&&req.query.type!="undefined") where.type=req.query.type
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0

    const count=await Mails.count({where})
    const data=await Mails.findAll({
        where,
        limit,
        offset,
        order:[["createdAt","DESC"]]
    })
    const notRead=await Mails.count({where:{sellerRead:false,sellerId:req.seller.id}})
    console.log(59,notRead)
    return res.send({data,count,notRead})
})
exports.getMail=catchAsync(async(req,res,next)=>{
    const mail=await Mails.findOne({where:{id:req.params.id}})
    return res.send(mail)
})

exports.isRead=catchAsync(async(req,res,next)=>{
    console.log(68)
    const unreadMails=await Mails.findAll({
        where: {
          sellerRead: false,
          sellerId:req.seller.id
        }
      });
      for (const mail of unreadMails) {
        mail.sellerRead = true;
        await mail.save();
      }
    return res.send("Sucess")
})