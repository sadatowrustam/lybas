const bcrypt = require("bcryptjs");
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Users, Products, Images, Likedproducts,Productsizes,Sizes,Notification,Mails,Newsletter } = require('../../models');
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
    const {  password,username } = req.body;
    if (!username)
        return next(new AppError('Invalid credentials', 400));

    const user = await Users.findOne({ where: { id: [req.user.id] } });
    if(password){
        let newPassword = await bcrypt.hash(password, 12);
        await user.update({password:newPassword})
    }
    await user.update({
        username,
    });
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
    const id = req.user.id;
    const user = await Users.findOne({ where: { id } });
    req.files = Object.values(req.files)
    if (!user)
        return next(new AppError('User did not found with that ID', 404));
    const image = `${id}_user.webp`;
    const photo = req.files[0].data
    let buffer = await sharp(photo).webp().toBuffer()
    await sharp(buffer).toFile(`static/${image}`);
    await user.update({
        image
    });
    return res.status(201).send(user)
});
exports.getNotifications = catchAsync(async(req, res, next) => {
    const updateNotif = await Notification.findOne({where:{id:req.params.id}})
    return res.status(200).send(updateNotif)
})
exports.subscribeToNews = catchAsync(async(req, res, next) => {
    req.body.type="newsletter"
    req.body.mail=req.body.email
    req.body.data=JSON.stringify({s:"s"})
    req.body.isRead=false
    const mail=await Mails.create(req.body)
    const newsletter=await Newsletter.create({mail:req.body.mail})
    console.log(newsletter)
    const io=req.app.get("socketio")
    io.emit("admin-mail")
    return res.status(200).send(mail)
})
exports.deliverAbroad = catchAsync(async(req, res, next) => {
    req.body.type="deliveryAbroad"
    req.body.data=JSON.stringify(req.body)
    req.body.isRead=false
    const mail=await Mails.create(req.body)
    const io=req.app.get("socketio")
    io.emit("admin-mail")
    return res.status(200).send(mail)
})