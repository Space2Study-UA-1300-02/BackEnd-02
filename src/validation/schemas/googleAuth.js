const googleAuthValidationSchema = {
  token: {
    type: 'object',
    required: true,
    properties: {
      credential: {
        type: 'string',
        required: true
      }
    }
  },
  role: {
    type: 'string',
    enum: ['student', 'tutor', 'admin'],
    required: false
  }
}

module.exports = { googleAuthValidationSchema }
