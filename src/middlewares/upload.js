const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../configs/cloudinary')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const { type = 'uploads' } = req.body

    const folderMap = {
      user: 'users',
      category: 'categories',
      subject: 'subjects',
      uploads: 'uploads'
    }

    const folder = folderMap[type] || 'uploads'

    return {
      folder: folder,
      format: 'webp',
      public_id: `${folder}-${Date.now()}-${file.originalname.split('.')[0]}`
    }
  }
})

const upload = multer({ storage })

module.exports = upload
