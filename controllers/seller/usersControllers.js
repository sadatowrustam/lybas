const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller,Products,Sellercategory } = require('../../models');
const { createSendToken } = require('./../../utils/createSendToken');
const sharp = require('sharp');
exports.getMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.seller);
});

exports.updateMyPassword = catchAsync(async(req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!currentPassword || !newPassword)
        return next(
            new AppError(
                'You have to provide your current password and new password',
                400
            )
        );

    if (newPassword != newPasswordConfirm || newPassword.length < 6)
        return next(
            new AppError(
                'New Passwords are not the same or less than 6 characters',
                400
            )
        );

    const user = await Seller.findOne({ where: { id: [req.seller.id] } });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    const password = await bcrypt.hash(newPassword, 12);
    await user.update({password});

    createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async(req, res, next) => {
    const { name_tm,name_ru, address,email,newCategory } = req.body;
    if (!name_tm ||!name_ru || !address)
        return next(new AppError('Invalid credentials', 400));

    const seller = await Seller.findOne({ where: { id: [req.seller.id] } });
    let isActive = false
    await seller.update({
        name_tm,
        name_ru,
        isActive,
        address,
        email
    });
    if(newCategory.length!=0){
        for(const oneCategory of newCategory){
            await Sellercategory.create({categoryId: oneCategory.id,sellerId:seller.id})
        }
    }
    createSendToken(seller, 200, res);
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await Seller.destroy({ where: { id:req.seller.id} });
    const products=await Products.findAll({where:{sellerId:req.seller.id}})

    res.status(200).send('User Successfully Deleted');
});
exports.uploadSellerImage = catchAsync(async(req, res, next) => {
    const updateSeller = await Seller.findOne({ where: { id: req.seller.id } });
    req.files = Object.values(req.files)
    if (!updateSeller)
        return next(new AppError('Brand did not found with that ID', 404));

    const image = `${req.seller.id}_seller.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()

    await sharp(buffer).toFile(`static/${image}`);

    await updateSeller.update({
        image,
    });
    return res.status(201).send(updateSeller);
});