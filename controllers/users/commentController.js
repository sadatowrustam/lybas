const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Comments,Images,Orderproducts,Address,Users,Products } = require("../../models")
const fs=require("fs")
const sharp=require("sharp")
const {v4}=require("uuid")
exports.addMyComment = catchAsync(async(req, res, next) => {
    req.body.userId = req.user.id
    const address=await Address.findAll({where:{userId:req.user.id},limit:1,order:[["createdAt","DESC"]]})
    req.body.welayat=address.welayat
    const orderproducts=await Orderproducts.findOne({where:{id:req.body.orderproductId}})
    await orderproducts.update({isCommented:true})
    const product=await Products.findOne({id:orderproducts.productId})

    req.body.sellerId=product.sellerId
    let comment = await Comments.create(req.body)
    const bigRating=(product.rating*product.rating_count)+req.body.rate
    const average=bigRating/(product.rating_count+1)
    await product.update({rating:average,rating_count:product.rating_count+1})
    return res.status(201).send(comment)
})
exports.getAllComments = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset
    const data = await Comments.findAll({ where: { userId: req.user.id }, limit, offset,order:[["createdAt","DESC"]],
    include:[
        {
            model:Users,
            as:"user"
        },
            {
                model:Images,
                as:"images"
            }
        ]  })
    const count=await Comments.count({where: { userId: req.user.id}})
    return res.status(200).send({data,count})
})
exports.editMyComment = catchAsync(async(req, res, next) => {
    const comment = await Comments.findOne({ where: { id: req.params.id } })
    if (!comment) return next(new AppError("Comments not found with that id", 404))
    await comment.update({ text: req.body.text, welayat: req.body.welayat })
    return res.status(200).send(comment)
})
exports.deleteMyComment = catchAsync(async(req, res, next) => {
    const comment = await Comments.findOne({ where: { id: req.params.id } })
    if (!comment) return next(new AppError("Comments not found with that id", 404))
    await comment.destroy()
    return res.status(200).send({ msg: "Success" })
})
exports.getComment = catchAsync(async(req, res, next) => {
    const comment = await Comments.findOne({ where: { id: req.params.id },include:[{model:Users,as:"user"},{model:Images,as:"images"}] })
    if (!comment) return next(new AppError("Comments not found with that id", 404))
    return res.status(200).send(comment)
})
exports.uploadImage = catchAsync(async(req, res, next) => {
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    for (const images of req.files) {
        const image_id = v4()
        const image = `${image_id}_comment.webp`;
        const photo = images.data
        let buffer = await sharp(photo).webp().toBuffer()
        await sharp(buffer).toFile(`static/${image}`);
        let newImage = await Images.create({ image, id:image_id, commentId: req.params.id })

    }
    return res.status(201).send("Sucesss");
});
exports.deleteProductImage = catchAsync(async(req, res, next) => {
    const image = await Images.findOne({ where: { id: req.params.id } })

    fs.unlink(`static/${image.image}`, function(err) {
        if (err) throw err;
    })
    await image.destroy()
    return res.status(200).send({ msg: "Sucess" })

})
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}