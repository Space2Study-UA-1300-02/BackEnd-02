const Subject = require('~/models/subject')
const Category = require('~/models/category')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const mongoose = require('mongoose')

const getSubjects = async () => {
  return Subject.find()
}

const getSubjectNames = async () => {
  const subjects = await Subject.find({}, 'name')
  return subjects.map((subject) => subject.name)
}

const getSubjectById = async (id) => {
  const subject = await Subject.findOne({ id })
  if (!subject) throw DOCUMENT_NOT_FOUND('Subject')
  return subject
}

const getSubjectsByCategoryId = async (categoryId) => {
  let query = {}
  if (mongoose.Types.ObjectId.isValid(categoryId)) {
    query._id = categoryId
  } else if (!isNaN(categoryId)) {
    query.id = Number(categoryId)
  } else {
    throw new Error('Invalid category ID format')
  }
  const category = await Category.findOne(query).select('id')
  if (!category) {
    throw new Error('Category not found')
  }
  const subjects = await Subject.find({ categoryId: category.id }, 'name')
  return {
    items: subjects.map((subject) => {
      return {
        name: subject.name,
        _id: subject._id
      }
    })
  }
}

const createSubject = async (subjectData) => {
  const lastSubject = await Subject.findOne().sort('-id')
  const newId = lastSubject ? lastSubject.id + 1 : 1
  return Subject.create({ ...subjectData, id: newId })
}

const updateSubject = async (id, updateData) => {
  const updateFields = {}

  if (updateData.categoryId) {
    updateFields.categoryId = updateData.categoryId
  }
  if (updateData.appearance?.icon) {
    updateFields['appearance.icon'] = updateData.appearance.icon
  }
  if (updateData.appearance?.color) {
    updateFields['appearance.color'] = updateData.appearance.color
  }

  const subject = await Subject.findOneAndUpdate({ id }, { $set: updateFields }, { new: true })

  if (!subject) throw DOCUMENT_NOT_FOUND('Subject')
  return subject
}

const deleteSubject = async (id) => {
  const subject = await Subject.findOneAndDelete({ id })
  if (!subject) throw DOCUMENT_NOT_FOUND('Subject')
  return subject
}

module.exports = {
  getSubjects,
  getSubjectById,
  getSubjectsByCategoryId,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectNames
}
