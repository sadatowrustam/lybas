const { Colors } = require("../../models")
const catchAsync = require('../../utils/catchAsync');

exports.getAllColors = catchAsync(async(req, res, next) => {
    const limit=req.query.limit || 20
    const offset=req.query.offset ||0
    const colors = await Colors.findAll({
        limit,
        offset,
        order: [
            ["createdAt", "DESC"]
        ]
    })
    const count=await Colors.count()
    return res.status(201).send({colors,count})
})