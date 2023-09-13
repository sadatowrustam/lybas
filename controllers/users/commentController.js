const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Comment } = require("../../models")
exports.addMyComment = catchAsync(async(req, res, next) => {
    req.body.userId = req.user.id
    let address = await Comment.create(req.body)
    return res.status(201).send(address)
})
exports.getAllComments = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset
    const comment = await Comment.findAll({ where: { userId: req.user.id }, limit, offset })
    return res.status(200).send({ comment })
})
exports.editMyComment = catchAsync(async(req, res, next) => {
    const comment = await Comment.findOne({ where: { id: req.params.id } })
    if (!comment) return next(new AppError("Comment not found with that id", 404))
    await comment.update({ text: req.body.text, welayat: req.body.welayat })
    return res.status(200).send(comment)
})
exports.deleteMyComment = catchAsync(async(req, res, next) => {
    const comment = await Comment.findOne({ where: { id: req.params.id } })
    if (!comment) return next(new AppError("Comment not found with that id", 404))
    await comment.destroy()
    return res.status(200).send({ msg: "Success" })
})
exports.getComment = catchAsync(async(req, res, next) => {
    const comment = await Comment.findOne({ where: { id: req.params.id } })
    if (!comment) return next(new AppError("Comment not found with that id", 404))
    return res.status(200).send(comment)
})