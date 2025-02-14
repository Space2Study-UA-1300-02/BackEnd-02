const express = require('express')
const upload = require('../middlewares/upload')
const { uploadAndUpdate } = require('../controllers/upload')
const asyncWrapper = require('../middlewares/asyncWrapper')

const router = express.Router()

router.post('/', upload.single('image'), asyncWrapper(uploadAndUpdate))


module.exports = router
