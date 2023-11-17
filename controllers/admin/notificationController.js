const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {Op}=require('sequelize')
const axios=require("axios")
const { Notification,Users,Newsletter } = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllNotifications = catchAsync(async(req,res,next)=>{
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
                    name: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    text: {
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
    where.type="public"
    const data = await Notification.findAll({where})
    const count=await Notification.count({where})
    return res.send({data,count})
})
exports.addNotification = catchAsync(async(req, res, next) => {
    req.body.count=await Users.count()
    req.body.type="public"
    req.body.isRead=true
    const socket=req.app.get("socketio")
    const newNotification = await Notification.create(req.body);
   const newsletter=await Newsletter.findAll()
    let mails=[]
    for(let i=0;i<newsletter.length;i++){
        mails.push(newsletter[i].mail)
    }
    let mail_data={
        text:req.body.text,
        mails,
        subject:"News from lybas"
    }
    try {
        const response=await axios.post("http://localhost:5012/send-mail",mail_data)
    } catch (error) {
        console.log(error)
    }
    socket.emit("user-notification")
    return res.status(201).send(newNotification);
});
exports.editNotification = catchAsync(async(req, res, next) => {
    const updateNotif = await Notification.findOne({where:{ id: req.params.id }})
    if (!updateNotif)
        return next(new AppError("not found"), 404)
    await updateNotif.update(req.body)
    return res.status(200).send(updateNotif)
})

exports.deleteNotification = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const notifaction = await Notification.findOne({ where: { id } });

    if (!notifaction)
        return next(new AppError('Not found with that ID', 404));
    await notifaction.destroy();

    return res.status(200).send('Successfully Deleted');
});