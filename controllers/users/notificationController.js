const catchAsync = require('../../utils/catchAsync');

const { Notification } = require('../../models');
const {Op}=require("sequelize")

exports.getAllNotifications = catchAsync(async(req,res,next)=>{
    const limit=req.query.limit || 10
    const offset=req.query.offset ||0
    var where = {
        [Op.or]:[{type:"public"},{userId:req.user.id}]
    };
    let order=[["createdAt","DESC"]]
    const data = await Notification.findAll({where,limit,offset,order})
    const count=await Notification.count({where:{userId:req.user.id,isRead:false}})
    return res.send({data,count})
})
exports.isRead=catchAsync(async(req,res,next)=>{
    await Notification.update({isRead:true},{where:{userId:req.user.id}})
    return res.status(200).send("Success")
}) 