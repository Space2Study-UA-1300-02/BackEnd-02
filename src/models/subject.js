const { Schema, model } = require('mongoose')
const { SUBJECT } = require('~/consts/models')
const { FIELD_CANNOT_BE_EMPTY, DOCUMENT_ALREADY_EXISTS } = require('~/consts/errors')

const subjectSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    categoryId: {
      type: Number,
      required: [true, FIELD_CANNOT_BE_EMPTY('category id')]
    },
    name: {
      type: String,
      required: [true, FIELD_CANNOT_BE_EMPTY('subject name')],
      unique: true,
      validate: {
        validator: function(value) {
          return value.trim().length > 0
        },
        message: FIELD_CANNOT_BE_EMPTY('subject name')
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

subjectSchema.pre('save', async function(next) {
  if (!this.id) {
    const lastSubject = await this.constructor.findOne().sort('-id')
    this.id = lastSubject ? lastSubject.id + 1 : 1
  }
  next()
})

subjectSchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    next(DOCUMENT_ALREADY_EXISTS(Object.keys(error.keyPattern)))
  }
  next(error)
})

module.exports = model(SUBJECT, subjectSchema)
