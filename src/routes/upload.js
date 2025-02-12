const express = require('express')
const upload = require('../middlewares/upload')
const { uploadFile } = require('../controllers/upload')
const asyncWrapper = require('../middlewares/asyncWrapper')

const router = express.Router()

router.post('/user', upload.single('image'), asyncWrapper(uploadFile))
router.post('/category', upload.single('image'), asyncWrapper(uploadFile))
router.post('/subject', upload.single('image'), asyncWrapper(uploadFile))

module.exports = router
