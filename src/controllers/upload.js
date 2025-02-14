// controllers/upload.js

const categoryService = require('../services/category')
const subjectService = require('../services/subject')

const uploadAndUpdate = async (req, res) => {
  try {
    const { type, id } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'File not uploaded' })
    }

    const imageUrl = req.file.path

    let result
    const updateData = {
      appearance: {
        icon: imageUrl
      }
    }

    if (type === 'category') {
      result = await categoryService.updateCategory(id, updateData)
    } else if (type === 'subject') {
      result = await subjectService.updateSubject(id, updateData)
    } else {
      return res.status(400).json({ error: 'Invalid type' })
    }

    res.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = { uploadAndUpdate }
