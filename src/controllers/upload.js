const categoryService = require('../services/category')
const subjectService = require('../services/subject')
const userService = require('../services/user')

const uploadAndUpdate = async (req, res) => {
  try {
    const { type, id, role } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'File not uploaded' })
    }

    const imageUrl = req.file.path
    let result

    switch (type) {
    case 'category':
      result = await categoryService.updateCategory(id, {
        appearance: { icon: imageUrl }
      })
      break

    case 'subject':
      result = await subjectService.updateSubject(id, {
        appearance: { icon: imageUrl }
      })
      break

    case 'user':
      if (!id) {
        return res.status(400).json({ error: 'Email is required for user updates' })
      }
      const user = await userService.getUserById(id, role)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      await userService.privateUpdateUser(user._id, { photo: imageUrl })
      result = { photo: imageUrl }
      break

    default:
      return res.status(400).json({ error: 'Invalid type' })
    }

    res.json(result)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = { uploadAndUpdate }
