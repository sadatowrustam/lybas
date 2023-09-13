const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

const { Banners, Products } = require('../../models');

exports.addBanner = catchAsync(async(req, res, next) => {
    const newBanner = await Banners.create(req.body);
    return res.status(201).send(newBanner);
});
exports.editBanner = catchAsync(async(req, res, next) => {
    const updateBanner = await Banners.findOne({where:{ id: req.params.id }})
    if (!updateBanner)
        return next(new AppError("Banner with that id not found"), 404)
    await updateBanner.update(req.body)
    return res.status(200).send(updateBanner)
})
exports.uploadBannerImage = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const banner = await Banners.findOne({ where: { id } });
    req.files = Object.values(req.files)
    if (!banner)
        return next(new AppError('Banner did not found with that ID', 404));
    const image = `${id}_banner.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()
    await sharp(buffer).toFile(`static/${image}`);

    await banner.update({
        image,
    });

    return res.status(201).send(banner);
});
exports.deleteBanner = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const banner = await Banners.findOne({ where: { id } });

    if (!banner)
        return next(new AppError('Banner did not found with that ID', 404));

    if (banner.image) {
        fs.unlink(`static/${id}_banner.webp`, function(err) {
            if (err) throw err;
        });
    }
    await banner.destroy();

    return res.status(200).send('Successfully Deleted');
});