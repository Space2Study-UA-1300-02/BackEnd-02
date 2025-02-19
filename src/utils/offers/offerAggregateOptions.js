const mongoose = require('mongoose')
const getRegex = require('../getRegex')

const offerAggregateOptions = (query, params) => {
  const {
    authorRole,
    price,
    proficiencyLevel,
    rating,
    language,
    search,
    languages,
    nativeLanguage,
    excludedOfferId,
    sort = 'createdAt',
    status,
    skip = 0,
    limit = 5,
    // Додаємо нові параметри
    category,
    subject,
    categories,
    subjects
  } = query
  const { id: authorId } = params

  const match = {}

  // Пошук по категоріям
  if (category) {
    match.category = mongoose.Types.ObjectId(category)
  }
  if (categories) {
    match.category = { $in: categories.map(id => mongoose.Types.ObjectId(id)) }
  }

  // Пошук по предметам
  if (subject) {
    match.subject = mongoose.Types.ObjectId(subject)
  }
  if (subjects) {
    match.subject = { $in: subjects.map(id => mongoose.Types.ObjectId(id)) }
  }

  if (search) {
    const searchArray = search.trim().split(' ')
    const firstNameRegex = getRegex(searchArray[0])
    const lastNameRegex = getRegex(searchArray[1])

    const additionalFields = authorId
      ? [
        { 'subject.name': getRegex(search) },
        { 'category.name': getRegex(search) }
      ]
      : [
        { 'author.firstName': firstNameRegex, 'author.lastName': lastNameRegex },
        { 'author.firstName': lastNameRegex, 'author.lastName': firstNameRegex },
        { 'subject.name': getRegex(search) },
        { 'category.name': getRegex(search) }
      ]

    match['$or'] = [{ title: getRegex(search) }, ...additionalFields]
  }

  if (authorId) {
    match['author._id'] = mongoose.Types.ObjectId(authorId)
  }

  if (authorRole) {
    match.authorRole = authorRole
  }

  if (proficiencyLevel) {
    match.proficiencyLevel = { $in: proficiencyLevel }
  }

  if (price) {
    const [minPrice, maxPrice] = price
    match.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
  }

  if (rating) {
    match[`author.averageRating.${authorRole}`] = { $gte: parseInt(rating) }
  }

  if (language) {
    match.languages = getRegex(language)
  }

  if (languages) {
    match.languages = { $in: languages }
  }

  if (status) {
    match.status = status
  }

  if (nativeLanguage) {
    match['author.nativeLanguage'] = getRegex(nativeLanguage)
  }

  if (excludedOfferId) {
    match._id = { $ne: mongoose.Types.ObjectId(excludedOfferId) }
  }

  let sortOption = {}

  if (sort) {
    try {
      const parsedSort = JSON.parse(sort)
      const { order, orderBy } = parsedSort
      const sortOrder = order === 'asc' ? 1 : -1
      sortOption = { [orderBy]: sortOrder }
    } catch {
      if (typeof sort === 'string') {
        if (sort === 'priceAsc') {
          sortOption['price'] = 1
        } else if (sort === 'priceDesc') {
          sortOption['price'] = -1
        } else if (sort === 'rating') {
          sortOption[`author.averageRating.${authorRole}`] = -1
        } else {
          sortOption[sort] = -1
        }
      }
    }
  }

  return [
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              averageRating: 1,
              totalReviews: 1,
              nativeLanguage: 1,
              photo: 1,
              professionalSummary: 1,
              FAQ: 1
            }
          }
        ],
        as: 'author'
      }
    },
    // Додаємо lookup для категорій і предметів
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1,
              appearance: 1
            }
          }
        ],
        as: 'category'
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subject',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'subject'
      }
    },
    {
      $unwind: '$author'
    },
    {
      $unwind: '$category'
    },
    {
      $unwind: '$subject'
    },
    {
      $match: match
    },
    {
      $sort: sortOption
    },
    {
      $facet: {
        count: [{ $count: 'count' }],
        items: [{ $skip: Number(skip) }, { $limit: Number(limit) }]
      }
    },
    {
      $project: {
        count: {
          $cond: {
            if: { $eq: ['$count', []] },
            then: 0,
            else: { $arrayElemAt: ['$count.count', 0] }
          }
        },
        items: 1
      }
    }
  ]
}

module.exports = offerAggregateOptions
