const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users,Verification,Notification } = require('../../models');
const { createSendToken } = require('./../../utils/createSendToken');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const randomstring = require("randomstring")

exports.verify_code = catchAsync(async(req, res, next) => {
    if (!req.body.user_checked_phone) {
        const { user_phone } = req.body;
        const user = await Users.findOne({ where: { user_phone } });
        if (user) {
            return next(new AppError('This number has already signed as user', 400));
        }
        const generated_code = randomstring.generate({
            length: 6,
            charset: "numeric"
        })
        const obj = {
            code: generated_code,
            number: user_phone,
            sms: 'Lybas tassyklaýyş koduňyz: '+generated_code,
        };
        var io = req.app.get('socketio');
        io.emit("verification-phone", obj)
        console.log(generated_code)
        await Verification.create({user_phone,code:generated_code})
        res.send("Verification code is sent")
    } else next();
});

exports.verify_code_forgotten = catchAsync(async(req, res, next) => {
    if (!req.body.user_checked_phone) {
        const { user_phone } = req.body;

        const user = await Users.findOne({ where: { user_phone } });

        if (!user) {
            return next(new AppError('This number has not signed as user', 400));
        }

        const generated_code = randomstring.generate({
            length: 6,
            charset: "numeric"
        })
        console.log(generated_code)
        const obj = {
            code: generated_code,
            number: user_phone,
            sms: 'Lybas tassyklaýyş koduňyz: ' + generated_code,

        }
        var io = req.app.get('socketio');
        io.emit("verification-phone", obj)
        await Verification.create({user_phone,code:generated_code})
        res.status(200).json({ id: generated_code });
    } else next();
});

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

    const decoded = await promisify(jwt.verify)(token, 'rustam');

    const freshUser = await Users.findOne({ where: { id: [decoded.id] } });

    if (!freshUser) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }

    req.user = freshUser;
    next();
});

exports.signup = catchAsync(async(req, res, next) => {
    if (req.body.user_checked_phone) {
        let {
            username,
            user_checked_phone,
            password,
            passwordConfirm,
            code
        } = req.body;
        console.log(req.body)
        const verification=await Verification.findOne({where:{user_phone:user_checked_phone,code}})
        if(!verification) return next(new AppError("Wrong verification code",401))
        if (password != passwordConfirm)
            return next(new AppError('Passwords are not the same', 400));
        password = await bcrypt.hash(password, 12)
        const user = await Users.findOne({
            where: { user_phone: [user_checked_phone] },
        });
        if (user) {
            return next(new AppError('This number has already registered', 400));
        }
        const newUser = await Users.create({
            username,
            user_phone: user_checked_phone,
            password,
        });
        await verification.destroy()
        const notif=await Notification.create({userId:newUser.id,link:"http://localhost:3000/profile",text:"This is text",type:"register"})
        createSendToken(newUser, 201, res);
    } else {
        res.send(400).json({
            msg: 'Firstly you have to verify your number',
        });
    }
});

exports.login = catchAsync(async(req, res, next) => {
    const { user_phone, password } = req.body;
    console.log(req.headers["user-agent"])
    if (!user_phone || !password) {
        return next(new AppError('Please provide phone number and password', 400));
    }

    const user = await Users.findOne({ where: { user_phone } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }
    user.password = undefined
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async(req, res, next) => {
    if (req.body.user_checked_phone) {
        console.log(142)
        let { user_checked_phone, password, password_confirm } = req.body;
        if (password != password_confirm)
            return next(
                new AppError(
                    'Passwords are not the same or less than 6 characters',
                    400
                )
            );
        const user = await Users.findOne({
            where: { user_phone: user_checked_phone },
        });
        if (!user) return next(new AppError('User not found', 404));

        password = await bcrypt.hash(password, 12);
        await user.update({ password });

        createSendToken(user, 200, res);
    } else {
        res.send(400).json({
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