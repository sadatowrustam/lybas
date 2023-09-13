const {
    Materials,
    Products,
    Images
} = require('../../models');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.getAllMaterials = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const materials = await Materials.findAll({
        limit,
        offset,
        order: [
            ['createdAt', 'ASC'],
        ],
    });
    const count=await Materials.count()
    return res.status(200).send({materials,count});
});
