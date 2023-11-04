const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {v4}=require("uuid")
const { Blogs,Images,Video } = require('../../models');

exports.getAllBlogs=catchAsync(async(req,res,next)=>{
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0
    const blogs=await Blogs.findAndCountAll({
        order:[["updatedAt","DESC"]],
        limit,
        offset,
    })
    return res.send(blogs)
})
exports.addBlogs=catchAsync(async(req,res,next)=>{
    const blogs=await Blogs.create(req.body);
    return res.status(201).send(blogs)
})
exports.editBlogs=catchAsync(async(req,res,next)=>{
    const blogs=await Blogs.findOne({where:{id:req.params.id}})
    if(!blogs) return next(new AppError("Blogs not found",404))
    await blogs.update(req.body)
    return res.send(blogs)
})
exports.deleteBlogs=catchAsync(async(req,res,next)=>{
    const blogs=await Blogs.findOne({where:{id:req.params.id}})
    if(!blogs) return next(new AppError("Blogs not found",404))
    await blogs.destroy()
    return res.send("Success")
})
exports.uploadImages=catchAsync(async(req,res,next)=>{
    const id = req.params.id;
    const blogs = await Blogs.findOne({ where: { id } });
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    if (!blogs)
        return next(new AppError('Blogs did not found with that ID', 404));
    for (const images of req.files) {
        const image_id = v4()
        const image = `${image_id}_news.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        await blogs.update({image})
    }
    return res.status(201).send(blogs);
})
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}