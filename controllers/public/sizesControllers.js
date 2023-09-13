const { Sizes } = require("../../models")
const catchAsync = require('../../utils/catchAsync');

exports.getAllSizes = catchAsync(async(req, res, next) => {
    const limit=req.query.limit || 20
    const offset=req.query.offset ||0
    const sizes = await Sizes.findAll({
        limit,
        offset,
        order: [
            ["id", "DESC"]
        ]
    })
    const count=await Sizes.count()
    return res.status(201).send({sizes,count})
})