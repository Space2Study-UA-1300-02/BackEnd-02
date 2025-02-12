// src/services/category.js
const Category = require('~/models/category')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const getCategories = async () => {
  return Category.find()
}

const getCategoryById = async (id) => {
  const category = await Category.findOne({ id })  // Ищем по полю id
  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}


const createCategory = async (categoryData) => {
  const lastCategory = await Category.findOne().sort('-id') // Найти последнюю категорию
  const newId = lastCategory ? lastCategory.id + 1 : 1 // Инкрементируем ID
  return Category.create({...categoryData, id: newId})
}

const updateCategory = async (id, updateData) => {
  // Создаем объект для обновления, проверяя, что передано
  const updateFields = {}

  if (updateData.appearance?.icon) {
    updateFields['appearance.icon'] = updateData.appearance.icon
  }
  if (updateData.appearance?.color) {
    updateFields['appearance.color'] = updateData.appearance.color
  }

  // Если есть изменения, обновляем только те поля, которые переданы
  const category = await Category.findOneAndUpdate(
    { id },
    { $set: updateFields },  // Обновляем только те поля, которые присутствуют
    { new: true }
  )

  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}


const deleteCategory = async (id) => {
  const category = await Category.findOneAndDelete({ id })  // Ищем и удаляем по полю id
  if (!category) throw DOCUMENT_NOT_FOUND('Category')
  return category
}

const getCategoryNames = async () => {
  const categories = await Category.find({}, 'name')  // Ищем все документы, выбираем только поле name
  return categories.map(category => category.name)  // Возвращаем массив только с именами категорий
}


module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames
}
