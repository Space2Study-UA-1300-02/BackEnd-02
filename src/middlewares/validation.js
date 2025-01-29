const { createError } = require('~/utils/errorsHelper') // Імпортуємо функцію для створення помилок
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors') // Імпортуємо константу з повідомленням про помилку, якщо тіло запиту відсутнє
const { validateRequired, validateFunc } = require('~/utils/validationHelper') // Імпортуємо функції для валідації полів (обов'язковість і інші перевірки)

const validateField = (fieldKey, fieldSchema, fieldValue) => {
  validateRequired(fieldKey, fieldSchema?.required, fieldValue) // Перевіряємо, чи поле обов'язкове та чи є воно в запиті

  if (fieldSchema?.type === 'object' && fieldSchema?.properties && typeof fieldValue === 'object') {
    // Якщо поле є об'єктом і містить вкладені властивості, запускаємо рекурсивну валідацію
    Object.entries(fieldSchema.properties).forEach(([nestedKey, nestedSchema]) => {
      // Для кожної вкладеної властивості викликаємо validateField з її ключем та схемою
      validateField(`${fieldKey}.${nestedKey}`, nestedSchema, fieldValue[nestedKey])
    })
  } else {
    // Якщо поле примітивне, валідовуємо його за допомогою правил зі схеми
    Object.entries(fieldSchema).forEach(([validationType, validationValue]) => {
      if (validateFunc[validationType]) {
        // Якщо для типу валідації є відповідна функція, викликаємо її
        validateFunc[validationType](fieldKey, validationValue, fieldValue)
      }
    })
  }
}

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req // Отримуємо тіло запиту
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED) // Якщо тіло запиту відсутнє, генеруємо помилку
    }

    Object.entries(schema).forEach(([fieldKey, fieldSchema]) => {
      const fieldValue = body[fieldKey] // Для кожного поля отримуємо значення з тіла запиту
      validateField(fieldKey, fieldSchema, fieldValue) // Валідовуємо поле з його значенням і схемою
    })

    next() // Перехід до наступного middleware
  }
}

module.exports = validationMiddleware  // Експортуємо middleware для використання в роутері


/*
const { createError } = require('~/utils/errorsHelper')
const { BODY_IS_NOT_DEFINED } = require('~/consts/errors')
const { validateRequired, validateFunc } = require('~/utils/validationHelper')

const validationMiddleware = (schema) => {
  return (req, _res, next) => {
    const { body } = req
    if (!body) {
      throw createError(422, BODY_IS_NOT_DEFINED)
    }

    Object.entries(schema).forEach(([schemaFieldKey, schemaFieldValue]) => {
      const reqBodyField = body[schemaFieldKey]
      validateRequired(schemaFieldKey, schemaFieldValue?.required, reqBodyField)
      if (reqBodyField) {
        Object.entries(schemaFieldValue).forEach(([validationType, validationValue]) => {
          validateFunc[validationType](schemaFieldKey, validationValue, reqBodyField)
        })
      }
    })

    next()
  }
}

module.exports = validationMiddleware
*/
