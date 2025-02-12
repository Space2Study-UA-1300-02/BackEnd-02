const categoryService = require('~/services/category')

const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories()
  res.status(200).json(categories)
}

const getCategoryById = async (req, res) => {
  const { id } = req.params
  const category = await categoryService.getCategoryById(id)
  res.status(200).json(category)
}


const createCategory = async (req, res) => {
  const categoryData = req.body
  const category = await categoryService.createCategory(categoryData)
  res.status(201).json(category)
}

const updateCategory = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const updatedCategory = await categoryService.updateCategory(id, updateData)
  res.status(200).json(updatedCategory)
}


const deleteCategory = async (req, res) => {
  const { id } = req.params
  await categoryService.deleteCategory(id)
  res.status(204).end()
}

const getCategoryNames = async (req, res) => {
  const names = await categoryService.getCategoryNames()
  res.status(200).json(names)
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames
}
