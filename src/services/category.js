const Category = require('~/models/category')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')

const getCategories = async (page = 1, limit = 12, search = '') => {
  const skip = (page - 1) * limit;

  let query = {};

  // Добавляем поиск если есть параметр search и он не менее 3 символов
  if (search && search.length >= 3) {
    query.name = { $regex: search, $options: 'i' };
  }

  const categories = await Category.find(query)
    .sort({ id: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  return {
    error: false,
    data: categories,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + categories.length < total
    }
  };
}

const getCategoryById = async (id) => {
  if (id.length > 10) {
    const category = await Category.findOne({ _id: id })
    if (!category) throw DOCUMENT_NOT_FOUND('Category')
    return category
  } else {
    const category = await Category.findOne({ id })
    if (!category) throw DOCUMENT_NOT_FOUND('Category')
    return category;
  }
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

// Оставляем для обратной совместимости, но перенаправляем на основной метод
const searchCategories = async (search = '') => {
  return getCategories(1, 4, search);
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames,
  searchCategories
}
