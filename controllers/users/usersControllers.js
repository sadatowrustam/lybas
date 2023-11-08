const bcrypt = require("bcryptjs");
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Users, Products, Images, Likedproducts, Cards,Productsizes,Sizes } = require('../../models');
const { createSendToken } = require('./../../utils/createSendToken');
const { Op } = require("sequelize")
const sharp = require("sharp")
exports.getMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.user);
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
    const user = await Users.findOne({ where: { user_id: [req.user.user_id] } });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 400));
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    createSendToken(user, 200, res);
});

exports.updateMe = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const { username, nickname, } = req.body;
    if (!username || !nickname)
        return next(new AppError('Invalid credentials', 400));

    const user = await Users.findOne({ where: { user_id: [req.user.user_id] } });

    const has_username = await Users.findOne({ where: { nickname } })

    if (has_username) {
        if (has_username.user_id != req.user.user_id) return next(new AppError("This nickname is already taken"))
    }
    await user.update({
        username,
        nickname
    });
    console.log(user)
    createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    if (req.body.user_phone != req.user.user_phone) {
        return next(new AppError('Phone number is not correct', 400));
    }

    await Users.destroy({ where: { user_phone: req.user.user_phone } });

    res.status(200).send('User Successfully Deleted');
});
exports.likeProduct = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({ where: { id: req.query.id } })
    if (!product) return next(new AppError("Product with that id not found"))
    const liked_product = await Likedproducts.create({ userId: req.user.id, productId: product.id })
    await product.update({ likeCount: product.likeCount + 1 })
    return res.status(200).send({ liked_product, product })
})
exports.dislikeProduct = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({ where: { id: req.query.id } })
    if (!product) return next(new AppError("Product with that id not found", 404))
    const liked_product = await Likedproducts.findOne({ where: { productId: product.id, userId: req.user.id } })
    if (!liked_product) return next(new AppError("Liked product with that id not found", 404))
    await liked_product.destroy()
    await product.update({ likeCount: product.likeCount - 1 })
    return res.status(200).send({ msg: "Success" })
})
exports.getUsersLikedProducts = catchAsync(async(req, res, next) => {
    console.log(req.body)
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    const { sort } = req.query
    if (sort == 1) var order = [
        ["price", "DESC"]
    ]
    else if (sort == 2) var order = [
        ["price", "ASC"]
    ]
    else var order = [
        ["updatedAt", "DESC"]
    ]
    const liked_product = await Users.findOne({
        where: { id: req.user.id },
        include: {
            model: Products,
            as: "liked_products",
            include: [{
                model: Images,
                as: "images"
            }, 
            {
                model:Productsizes,
                as:"product_sizes",
                include:{
                    model:Sizes,
                    as:"size"
                }
            }
        ],
        }
    })
    for(let i=0; i<liked_product.liked_products.length;i++){
        liked_product.liked_products[i].isLiked=true
    }
    return res.status(200).send({ data: liked_product.liked_products })
})
exports.uploadUserImage = catchAsync(async(req, res, next) => {
    const user_id = req.user.user_id;
    const user = await Users.findOne({ where: { user_id } });
    req.files = Object.values(req.files)
    if (!user)
        return next(new AppError('User did not found with that ID', 404));
    const image = `${user_id}_user.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()
    await sharp(buffer).toFile(`static/${image}`);
    await user.update({
        image
    });
    return res.status(201).send(user)

});
exports.createCard = catchAsync(async(req, res, next) => {
    // const CryptoJS = require("crypto-js")
    // var ciphertext = CryptoJS.AES.encrypt('my message is bet', 'secret key 123').toString();
    // console.log(ciphertext)
    //  var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    //  var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(originalText)
    const { card_number } = req.body
    const card = await Cards.create({ card_number, userId: req.user.id })
    return res.status(200).send({ card })
})