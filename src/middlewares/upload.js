const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../configs/cloudinary')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'uploads'
    if (req.baseUrl.includes('/user')) folder = 'users'
    if (req.baseUrl.includes('/category')) folder = 'categories'
    if (req.baseUrl.includes('/subject')) folder = 'subjects'

    return {
      folder: folder,
      format: 'webp', // Convert to WebP
      public_id: file.originalname.split('.')[0]
    }
  }
})

const upload = multer({ storage })

module.exports = upload
