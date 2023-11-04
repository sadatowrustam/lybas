const fs = require('fs');
const sharp = require("sharp")
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Material
} = require('../../models');

exports.addMaterial = catchAsync(async(req, res) => {
    const newMaterial = await Material.create(req.body);
    return res.status(201).send(newMaterial);
});

exports.editMaterial = catchAsync(async(req, res, next) => {
    const material = await Material.findOne({
        where: { id: req.params.id },
    });

    if (!material)
        return next(new AppError('Category did not found with that ID', 404));

    const { name_tm, name_ru, name_en } = req.body;
    if (
        typeof name_tm !== 'string' ||
        name_tm.length < 1 ||
        typeof name_ru !== 'string' ||
        name_ru.length < 1
    )
        return next(new AppError('Invalid Credentials', 400));

    await material.update({ name_tm, name_ru, name_en });

    return res.status(200).send(material);
});

exports.deleteMaterial = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const material = await Material.findOne({ where: { id } });
    if (!material)
        return next(new AppError('Category did not found with that ID', 404));
    await material.destroy();

    return res.status(200).send('Successfully Deleted');
});
exports.getOneMaterial = catchAsync(async(req, res, next) => {
    let { id } = req.params
    const material = await Material.findOne({
        where: { id },
    });
    if (!material) {
        return next(new AppError("Category not found with that id", 404))
    }
    return res.status(200).send(material)
})