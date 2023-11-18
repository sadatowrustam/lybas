const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Seller,Verification } = require('../../models');
const randomstring = require('randomstring');
const { createSendTokenSeller } = require('./../../utils/createSendToken');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.verify_code_forgotten = catchAsync(async(req, res, next) => {
    console.log(req.body)
    if (req.body.user_phone) {
        const { user_phone } = req.body;
        const seller = await Seller.findOne({ where: { phone_number: user_phone } });
        if (!seller) {
            return next(new AppError('This number has not signed as seller', 400));
        }
        const generated_code = randomstring.generate({
            charset: "123456789",
            length: 6
        })
        const obj = {
            number: user_phone,
            sms: 'Taze parol ' + generated_code,
        };
        console.log(generated_code)
        var io = req.app.get('socketio');
        io.emit("verification-user_phone", obj)
        await Verification.create({user_phone:user_phone,code:generated_code})
        res.status(200).json("Code sent");
    } else next();
});
exports.login = catchAsync(async(req, res, next) => {
    const { nickname, password } = req.body
    const seller = await Seller.findOne({ where: { nickname } })
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }
    seller.password = undefined
    createSendTokenSeller(seller, 200, res)
})
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(
        new AppError('You are not logged in', 401)
    );

    const decoded = jwt.verify(token, 'rustam');

    const freshSeller = await Seller.findOne({ where: { id: [decoded.id] } });

    if (!freshSeller) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }
    freshSeller.password = undefined
    req.seller = freshSeller;
    next();
});
exports. forgotPassword = catchAsync(async(req, res, next) => {
    if (req.body.user_checked_phone) {
        console.log(req.body)
        let { user_checked_phone, password, password_confirm } = req.body;
        if (password != password_confirm) return next(new AppError('Passwords are not the same', 400));
        const seller = await Seller.findOne({
            where: { phone_number: user_checked_phone },
        });
        if (!seller) return next(new AppError('User not found', 404));
         password = await bcrypt.hash(password, 12);
        await seller.update({password});
        createSendTokenSeller(seller, 200, res);
    } else {
        return res.send(400).json({
            msg: 'Firstly you have to verify your number',
        });
    }
});
exports.checkCode=catchAsync(async(req,res,next)=>{
    const {user_phone,code}=req.body
    console.log(req.body)
    const verification=await Verification.findOne({where:{user_phone,code}})
    if(!verification) return next(new AppError("Wrong verification code",401)) 
    // const generated_code = randomstring.generate({
    //     length: 6,
    //     charset: "numeric"
    // })
    // console.log(generated_code)
    // const obj = {
    //     code: generated_code,
    //     number: user_phone,
    //     sms: 'Taze parolynyz: ' + generated_code,

    // }
    // let password = await bcrypt.hash(generated_code, 12)
    // const user=await Users.findOne({where:{user_phone:phone_number}})
    // await user.update({password})
    // var io = req.app.get('socketio');
    // io.emit("verification-phone", obj)
    return res.send("True")
})