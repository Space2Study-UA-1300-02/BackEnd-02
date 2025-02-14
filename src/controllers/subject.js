const subjectService = require('~/services/subject')

const getSubjects = async (req, res) => {
  const subjects = await subjectService.getSubjects()
  res.status(200).json(subjects)
}

const getSubjectNames = async (req, res) => {
  const names = await subjectService.getSubjectNames()
  res.status(200).json(names)
}

const getSubjectById = async (req, res) => {
  const { id } = req.params
  const subject = await subjectService.getSubjectById(id)
  res.status(200).json(subject)
}

const getSubjectsByCategoryId = async (req, res) => {
  const { categoryId } = req.params
  const subjects = await subjectService.getSubjectsByCategoryId(categoryId)
  res.status(200).json(subjects)
}

const createSubject = async (req, res) => {
  const subject = await subjectService.createSubject(req.body)
  res.status(201).json(subject)
}

const updateSubject = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const updatedSubject = await subjectService.updateSubject(id, updateData)
  res.status(200).json(updatedSubject)
}

const deleteSubject = async (req, res) => {
  const { id } = req.params
  await subjectService.deleteSubject(id)
  res.status(204).end()
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
