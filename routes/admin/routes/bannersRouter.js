const express = require('express');
const {
    uploadImages,
    addBanner,
    deleteBanner,
    editBanner,
} = require('../../../controllers/admin/bannerControllers');
const {
    getAllBanners,
    getBanner,
} = require('../../../controllers/public/bannerControllers');
const { deleteImage } = require('../../../controllers/admin/blogsControllers');
const router = express.Router();
router.get('/', getAllBanners);
router.get('/:id', getBanner);
router.post('/add', addBanner);
router.patch("/:id", editBanner)
router.post('/delete/:id', deleteBanner);
router.post('/upload-image', uploadImages);
router.post('/delete-image/:image', deleteImage);

module.exports = router;