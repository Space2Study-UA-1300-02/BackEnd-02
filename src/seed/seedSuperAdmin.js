const User = require('~/models/user')
const {
  superAdmin: { firstName, lastName, email, password }
} = require('~/configs/config')
const {
  roles: { SUPERADMIN }
} = require('~/consts/auth')
const logger = require('~/logger/logger')

const SeedSuperAdmin = {
  createSuperAdmin: async () => {
    try {
      const superAdmin = {
        role: SUPERADMIN,
        firstName,
        lastName,
        email,
        password,
        active: true,
        isEmailConfirmed: true
      }

      return await User.create(superAdmin)
    } catch (err) {
      logger.error(err)
    }
  }
}

module.exports = SeedSuperAdmin
