const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {v4}=require("uuid")
const { Banners, Products } = require('../../models');

exports.addBanner = catchAsync(async(req, res, next) => {
    const newDate=new Date()
    req.body.startDate=new Date(req.body.startDate)
    if(newDate.getMonth()==req.body.startDate.getMonth() && newDate.getDate()>=req.body.startDate.getDate()){
        req.body.isActive=true
    }
    req.body.endDate=new Date(req.body.endDate)
    const newBanner = await Banners.create(req.body);
    return res.status(201).send(newBanner);
});
exports.editBanner = catchAsync(async(req, res, next) => {
    const updateBanner = await Banners.findOne({where:{ id: req.params.id }})
    if (!updateBanner)
        return next(new AppError("Banner with that id not found"), 404)
    if(newDate.getMonth()==req.body.startDate.getMonth() && newDate.getDate()>=req.body.startDate.getDate()){
        req.body.isActive=true
    }
    await updateBanner.update(req.body)
    return res.status(200).send(updateBanner)
})
exports.uploadImages=catchAsync(async(req,res,next)=>{
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    for (const images of req.files) {
        const image_id = v4()
        var image = `${image_id}.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        // await blogs.update({image})
    }
    return res.status(201).send(image);
})

exports.deleteBanner = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const banner = await Banners.findOne({ where: { id } });

    if (!banner)
        return next(new AppError('Banner did not found with that ID', 404));

    if (banner.image) {
        fs.unlink(`static/${banner.image}`, function(err) {
            if (err) throw err;
        });
    }
    await banner.destroy();

    return res.status(200).send('Successfully Deleted');
});
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}