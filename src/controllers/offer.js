const offerService = require('~/services/offer')
const offerAggregateOptions = require('~/utils/offers/offerAggregateOptions')

const getOffers = async (req, res) => {
  const pipeline = offerAggregateOptions(req.query, req.params)

  const offers = await offerService.getOffers(pipeline)

  res.status(200).json(offers)
}

const getOfferById = async (req, res) => {
  const { id } = req.params

  const offer = await offerService.getOfferById(id)

  res.status(200).json(offer)
}

const createOffer = async (req, res) => {
  const { author: authorId, authorRole, ...data } = req.body // версия для постмена

  /*const { id: authorId, role: authorRole } = req.user
  const data = req.body*/ // версия с включенным auth middleware


  const newOffer = await offerService.createOffer(authorId, authorRole, data)

  res.status(201).json(newOffer)
}

const updateOffer = async (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const { id: currentUserId } = req.user

  await offerService.updateOffer(id, currentUserId, updateData)

  res.status(204).end()
}

const deleteOffer = async (req, res) => {
  const { id } = req.params
  const { id: currentUserId } = req.user

  await offerService.deleteOffer(id, currentUserId)

  res.status(204).end()
}

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
}
