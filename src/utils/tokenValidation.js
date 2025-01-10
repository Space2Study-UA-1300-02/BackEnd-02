const { createUnauthorizedError } = require('~/utils/errorsHelper')
const tokenService = require('../services/token')

const tokenValidation = (accessToken) => {
  if (!accessToken) {
    throw createUnauthorizedError()
  }

  const userData = tokenService.validateAccessToken(accessToken)
  if (!userData) {
    throw createUnauthorizedError()
  }

  return userData
}

module.exports = { tokenValidation }
