// Імпортуємо бібліотеку Zod для валідації
const { z } = require('zod')
// Імпортуємо список дозволених ролей користувачів
const { enums: { ROLE_ENUM } } = require('~/consts/validation')

// Визначаємо схему валідації для даних, що надходять з запиту на Google авторизацію
const googleAuthValidationSchema = z.object({
  token: z.object({
    // Поле credential обов'язкове і має бути рядком з мінімум 1 символом
    credential: z.string().min(1, 'Credential is required')
  }),
  // Поле role повинно відповідати одному з дозволених значень ролей
  role: z.enum(ROLE_ENUM)  // Для ролі використовуємо z.enum
})

// Експортуємо схему для використання в інших частинах програми
module.exports = googleAuthValidationSchema


/*

const { enums: { ROLE_ENUM } } = require('~/consts/validation')

const googleAuthValidationSchema = {
  token: {
    credential: {
      type: 'string',
      required: true,
      validate: (value) => typeof value === 'string' && value.trim().length > 0
    }
  },
  role: {
    type: 'string',
    required: false,
    validate: (value) => ROLE_ENUM.includes(value)
  }
}

module.exports = googleAuthValidationSchema
*/
