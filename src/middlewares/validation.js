const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')

const validateField = (fieldKey, fieldSchema, fieldValue) => {
  validateRequired(fieldKey, fieldSchema?.required, fieldValue)

  if (fieldSchema?.type === 'object' && fieldSchema?.properties && typeof fieldValue === 'object') {
    // Рекурсивно валидируем вложенные свойства
    Object.entries(fieldSchema.properties).forEach(([nestedKey, nestedSchema]) => {
      validateField(`${fieldKey}.${nestedKey}`, nestedSchema, fieldValue[nestedKey])
    })
  } else {
    // Валидируем примитивные поля
    Object.entries(fieldSchema).forEach(([validationType, validationValue]) => {
      if (validateFunc[validationType]) {
        validateFunc[validationType](fieldKey, validationValue, fieldValue)
      }
    })
  }
}

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    Object.entries(schema).forEach(([fieldKey, fieldSchema]) => {
      const fieldValue = body[fieldKey]
      validateField(fieldKey, fieldSchema, fieldValue)
    })

    next()
  }
}

module.exports = validationMiddleware
