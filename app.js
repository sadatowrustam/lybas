const express = require('express');
var cors = require('cors');
const AppError = require('./utils/appError');
const fileupload = require("express-fileupload")
const app = express();

// app.use(require('helmet')())
const limiter = require('express-rate-limit')({
    max: 1000,
    windowMs: 1000,
    message: 'Too many requests from this IP, please try again in an hour',
});
app.use(
    cors({
        origin: '*',
    })
);
app.use(require('morgan')('dev'));
app.use('/', limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/static`));
app.use(fileupload())
app.use('/api/users', require('./routes/users/usersRouter'));
app.use('/api/chief', require('./routes/admin/adminRouter'));
app.use('/api/public', require('./routes/public/publicRouter'));
app.use("/api/seller", require("./routes/seller/sellerRouter"))
app.get("/api/:image",(req,res)=>{
    console.log("men barder")
    res.sendFile(req.params.image,{root:"./static"})
})
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(require('./controllers/errorController'));
app.use(require("./controllers/dateController"))

module.exports = app;