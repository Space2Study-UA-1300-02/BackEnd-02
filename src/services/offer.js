const Offer = require('~/models/offer')
const errors = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedOfferFieldsForUpdate } = require('~/validation/services/offer')

// Допоміжна функція перевірки прав
const checkInvolvement = async (offerId, userId) => {
  const offer = await Offer.findById(offerId)
  if (offer.author.toString() !== userId) {
    throw {
      status: 403,
      ...errors.FORBIDDEN
    }
  }
  return offer
}

const offerService = {
  getOffers: async (pipeline) => {
    const [response] = await Offer.aggregate(pipeline).exec()
    return response
  },

  getOfferById: async (id) => {
    const offer = await Offer.findById(id)
      .populate([
        {
          path: 'author',
          select: ['firstName', 'lastName', 'totalReviews', 'averageRating', 'photo', 'professionalSummary', 'FAQ']
        },
        { path: 'subject', select: 'name' },
        { path: 'category', select: 'appearance' }
      ])
      .lean()
      .exec()

    if (offer.author.FAQ && offer.authorRole in offer.author.FAQ) {
      offer.author.FAQ = offer.author.FAQ[offer.authorRole]
    } else {
      delete offer.author.FAQ
    }

    return offer
  },

  createOffer: async (author, authorRole, data) => {
    const { price, proficiencyLevel, title, description, languages, subject, category, status, FAQ } = data

    return await Offer.create({
      author,
      authorRole,
      price,
      proficiencyLevel,
      title,
      description,
      languages,
      subject,
      category,
      status,
      FAQ
    })
  },

  updateOffer: async (id, currentUserId, updateData) => {
    const offer = await checkInvolvement(id, currentUserId)

    const filteredUpdateData = filterAllowedFields(updateData, allowedOfferFieldsForUpdate)

    for (let field in filteredUpdateData) {
      offer[field] = filteredUpdateData[field]
    }

    await offer.validate()
    await offer.save()
  },

  deleteOffer: async (id, currentUserId) => {
    await checkInvolvement(id, currentUserId)
    await Offer.findByIdAndRemove(id).exec()
  }
}

module.exports = offerService
