const { Users } = require("../../models")
const AppError = require("../../utils/appError")
const catchAsync = require("../../utils/catchAsync")


exports.getAllUsers = catchAsync(async(req, res, next) => {
    const { user_phone } = req.query
    let where = {}
    if (user_phone) where.user_phone = user_phone
    const users = await Users.findAll({
        where,
        attributes: ["user_phone", "username", "image"]
    })
    return res.status(200).send(users)
})
exports.getStats=catchAsync(async(req,res,next)=>{
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const firstDayOfNextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const firstDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() -1, 1);
    
    const data = await Users.findAll({
        where: {
            createdAt: {
            between: [startDate, endDate]
            }
        }
    });
    const data2 = await Users.findAll({
        where: {
            createdAt: {
            between: [secondDate, startDate]
            }
        }
    });
    return res.status(200).send({data,data2})
})