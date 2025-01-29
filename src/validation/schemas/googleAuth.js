// validation/schemas/googleAuth.js
const { z } = require('zod')
const { enums: { ROLE_ENUM } } = require('~/consts/validation')

const googleAuthValidationSchema = z.object({
  token: z.object({
    credential: z.string().min(1, 'Credential is required')
  }),
  role: z.enum(ROLE_ENUM) // Для роли используем z.enum
})

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
