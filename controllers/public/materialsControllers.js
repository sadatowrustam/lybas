const {
    Material,
    Products,
    Images
} = require('../../models');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.getAllMaterials = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const data = await Material.findAll({
        limit,
        offset,
        order: [
            ['createdAt', 'ASC'],
        ],
    });
    const count=await Material.count()
    return res.status(200).send({data,count});
});
