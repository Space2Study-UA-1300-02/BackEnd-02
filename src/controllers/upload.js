const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      console.log('Error: file not uploaded')
      return res.status(400).json({ error: 'File not uploaded' })
    }

    const imageUrl = req.file.path
    res.json({ message: 'File uploaded', imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload error' })
  }
}

module.exports = { uploadFile }
