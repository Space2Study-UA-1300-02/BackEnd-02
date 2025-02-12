const { Schema, model } = require('mongoose')
const { CATEGORY } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, DOCUMENT_ALREADY_EXISTS } = require('~/consts/errors')

const categorySchema = new Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    name: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('category name')],
      unique: true,
      validate: {
        validator: function (value) {
          return value.trim().length > 0
        },
        message: FIELD_CANNOT_BE_EMPTY('category name')
      }
    },
    appearance: {
      icon: {
        type: String,
        required: [true, FIELD_CANNOT_BE_EMPTY('icon')],
        default: 'mocked-path-to-icon'
      },
      color: {
        type: String,
        required: [true, FIELD_CANNOT_BE_EMPTY('color')],
        default: '#66C42C'
      }
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false
  }
)

categorySchema.pre('save', async function (next) {
  if (!this.id) {
    const lastCategory = await this.constructor.findOne().sort('-id')
    this.id = lastCategory ? lastCategory.id + 1 : 1
  }
  next()
})

categorySchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(DOCUMENT_ALREADY_EXISTS(Object.keys(error.keyPattern)))
  }
  next(error)
})

module.exports = model(CATEGORY, categorySchema)
