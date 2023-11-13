const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Admin, Products,Verification } = require('../../models');
const randomstring=require("randomstring")
const fs = require("fs")
const sharp=require("sharp")
const { Op } = require("sequelize")
const signToken = (id) => {
    return jwt.sign({ id }, 'rustam', {
        expiresIn: '24h',
    });
};
const createSendToken = (admin, statusCode, res) => {
    const token = signToken(admin.id);
    res.status(statusCode).json({
        token,
        data: {
            admin,
        },
    });
};
exports.verify_code_forgotten = catchAsync(async(req, res, next) => {
    if (!req.body.user_checked_phone) {
        const { user_phone } = req.body;
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
        res.status(200).send("Code is sent");
    } else next();
});
exports.forgotPassword = catchAsync(async(req, res, next) => {
    if (req.body.user_checked_phone) {
        let {  password, password_confirm } = req.body;
        if (password != password_confirm)
            return next(
                new AppError(
                    'Passwords are not the same or less than 6 characters',
                    400
                )
            );
        const user = await Admin.findOne({});
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
exports.login = catchAsync(async(req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new AppError('Please provide username and  password', 400));
    }

    const admin = await Admin.findOne({ where: { username } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }

    createSendToken(admin, 200, res);
});
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged as an Admin!.', 401));
    }

    const decoded = await jwt.verify(token, 'rustam');
    console.log(decoded)
    const freshAdmin = await Admin.findOne({ where: { id: decoded.id } });

    if (!freshAdmin) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }
    req.admin = freshAdmin;
    next();
});
exports.sendMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.admin)
})
exports.updateMe = catchAsync(async(req, res, next) => {
    console.log(req.body)
    let { username, newPassword, email,welayat,login,user_phone,image } = req.body;

    if (!username) {
        return next(new AppError('Please provide username and  password', 400));
    }

    const admin = await Admin.findOne();

    if (newPassword) {
        await admin.update({
            password: await bcrypt.hash(newPassword, 12),
        });
    }
    if (typeof image!="string") image=""
    admin.update({
        username,
        email,
        welayat,
        login,
        user_phone,
        image
    });

    createSendToken(admin, 200, res);
});
exports.changeTime = catchAsync(async(req, res, next) => {
    const { newExpirationDay } = req.body
    console.log(req.body)
    var expiration_days = fs.readFileSync('./config/expire_time.txt', 'utf8')
    let today = new Date().getTime()
    let new_expiration_time_ms = Number(newExpirationDay) * 86400 * 1000
    if (newExpirationDay > Number(expiration_days)) {
        let expiration_time = today - new_expiration_time_ms
        var products = await Products.findAll({
            where: {
                is_new_expire: {
                    [Op.gt]: expiration_time
                },
                isNew: false
            },
        })
        for (const product of products) {
            await product.update({ isNew: true })
            console.log(`Product with id: ${product.product_id} is  new product now`)
        }
    } else {
        let expiration_time = today - new_expiration_time_ms
        var products = await Products.findAll({
            where: {
                is_new_expire: {
                    [Op.lt]: expiration_time
                },
                isNew: true
            },
        })
        for (const product of products) {
            await product.update({
                isNew: false
            })
            console.log(`Product with id: ${product.product_id} is not new product now`)
        }
    }
    fs.writeFileSync("config/expire_time.txt", newExpirationDay.toString())
    return res.status(200).send({ msg: "Sucess" })
})
exports.getTime = catchAsync(async(req, res, next) => {
    var expiration_days = fs.readFileSync('config/expire_time.txt', 'utf8')
    return res.status(200).send({ day: Number(expiration_days) })
})
exports.uploadAdminImage=catchAsync(async(req,res,next)=>{
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    const admin=await Admin.findOne()
    for (const images of req.files) {
        var image = `admin.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        await admin.update({image})
    }
    return res.status(201).send(admin);
})
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}
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