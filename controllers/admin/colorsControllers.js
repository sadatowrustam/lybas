const { Colors } = require("../../models")
const sharp = require("sharp")
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.addColor = catchAsync(async(req, res, next) => {
    const color = await Colors.create(req.body)
    return res.status(201).send(color)
})
exports.editColor = catchAsync(async(req, res, next) => {
    const color = await Colors.findOne({ where: { id: [req.params.id] } });

    if (!color)
        return next(new AppError('Brand did not found with that ID', 404));
    await color.update(req.body);

    return res.status(200).send(color);
});
exports.deleteColor = catchAsync(async(req, res, next) => {
    const color = await Colors.findOne({ where: { id: req.params.id } })
    if (!color) return next(new AppError("Color not found", 404))
    await color.destroy()
    return res.status(200).send({ msg: "Sucess" })
})