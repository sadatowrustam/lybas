const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

const { Notification,Users } = require('../../models');

exports.addNotification = catchAsync(async(req, res, next) => {
    req.body.count=await Users.count()
    req.body.type="public"
    const newNotification = await Notification.create(req.body);
    return res.status(201).send(newNotification);
});
exports.editNotification = catchAsync(async(req, res, next) => {
    const updateNotif = await Banners.findOne({where:{ id: req.params.id }})
    if (!updateNotif)
        return next(new AppError("Banner with that id not found"), 404)
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