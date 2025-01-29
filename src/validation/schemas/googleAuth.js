const { z } = require('zod')
const { enums: { ROLE_ENUM } } = require('~/consts/validation')

const googleAuthValidationSchema = z.object({
  token: z.object({
    credential: z.string().min(1, 'Credential is required')
  }),
  role: z.enum(ROLE_ENUM)
})

module.exports = googleAuthValidationSchema
