const { createForbiddenError } = require('~/utils/errorsHelper')
const { tokenValidation } = require('../utils/tokenValidation')

const authMiddleware = (req, _res, next) => {
  const accessToken = req.cookies.accessToken || req.headers.cookie
  const userData = tokenValidation(accessToken)
  req.user = userData

  next()
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError())
    }
    next()
  }
}

module.exports = { authMiddleware, restrictTo }
