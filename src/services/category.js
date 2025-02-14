const Category = require('~/models/category')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const getCategories = async () => {
  return Category.find()
}

const getCategoryById = async (id) => {
  const category = await Category.findOne({ id })
  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}


const createCategory = async (categoryData) => {
  const lastCategory = await Category.findOne().sort('-id')
  const newId = lastCategory ? lastCategory.id + 1 : 1
  return Category.create({...categoryData, id: newId})
}

const updateCategory = async (id, updateData) => {
  const updateFields = {}

  if (updateData.appearance?.icon) {
    updateFields['appearance.icon'] = updateData.appearance.icon
  }
  if (updateData.appearance?.color) {
    updateFields['appearance.color'] = updateData.appearance.color
  }

  const category = await Category.findOneAndUpdate(
    { id },
    { $set: updateFields },
    { new: true }
  )

  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}


const deleteCategory = async (id) => {
  const category = await Category.findOneAndDelete({ id })
  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}

const getCategoryNames = async () => {
  const categories = await Category.find({}, 'name')
  return categories.map(category => category.name)
}


module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames
}
