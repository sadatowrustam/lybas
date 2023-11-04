
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Blogs} = require('../../models');

exports.getBlog=catchAsync(async(req,res,next)=>{
    const blogs=await Blogs.findOne({where:{id:req.params.id}})
    if(!blogs) return next(new AppError("Blogs not found",404))
    return res.send(blogs)
})
