const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller } = require('../../models');
const jwt = require("jsonwebtoken")

const signToken = (id) => {
    return jwt.sign({ id }, 'rustam', {});
};
exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged as a Seller!.', 401));
    }
    const decoded = await jwt.verify(token, 'rustam');
    const seller = await Seller.findOne({ where: { id: decoded.id } });
    if (!seller) {
        return next(
            new AppError('The user belonging to this token is no longer exists', 401)
        );
    }
    req.seller = seller;
    next();
});
exports.getMe = catchAsync(async(req, res, next) => {
    return res.status(200).send(req.user);
});
exports.login = catchAsync(async(req, res, next) => {
    const { phone_number, password } = req.body;
    console.log(req.body)
    if (!phone_number || !password) {
        return next(new AppError('Please provide name and  password', 400));
    }
    const seller = await Seller.findOne({ where: { phone_number } });
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
        return res.status(401).send({ message: "Incorrect user phone or password" })
    }

    createSendToken(seller, 200, res);
});
const createSendToken = (seller, statusCode, res) => {
    const token = signToken(seller.id);

    res.cookie('jwt', token, {
        httpOnly: true,
    });

    res.status(statusCode).json({
        token,
        data: {
            seller,
        },
    });
};