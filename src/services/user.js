const User = require('~/models/user')
const { createError } = require('~/utils/errorsHelper')

const { DOCUMENT_NOT_FOUND, ALREADY_REGISTERED } = require('~/consts/errors')
const filterAllowedFields = require('~/utils/filterAllowedFields')
const { allowedUserFieldsForUpdate } = require('~/validation/services/user')

const userService = {
  getUsers: async ({ match, sort, skip, limit }) => {
    const count = await User.countDocuments(match)

    const items = await User.find(match)
      .select('+status')
      .sort(sort)
      .collation({ locale: 'en_US', strength: 2, caseLevel: false })
      .skip(skip)
      .limit(limit)
      .exec()

    return {
      items,
      count
    }
  },

  getUserById: async (id, role) => {
    return await User.findOne({ _id: id, ...(role && { role }) })
      .select('+lastLoginAs +isEmailConfirmed +isFirstLogin')
      .lean()
      .exec()
  },

  getUserByEmail: async (email) => {
    const user = await User.findOne({ email })
      .select('+password +lastLoginAs +isEmailConfirmed +isFirstLogin +appLanguage')
      .lean()
      .exec()

    if (!user) {
      return null
    }

    return user
  },

  createUser: async (role, firstName, lastName, email, password, appLanguage, isEmailConfirmed = false) => {
    const duplicateUser = await userService.getUserByEmail(email)

    if (duplicateUser) {
      throw createError(409, ALREADY_REGISTERED)
    }

    return await User.create({
      role,
      firstName,
      lastName,
      email,
      lastLoginAs: role,
      password,
      appLanguage,
      isEmailConfirmed
    })
  },

  createGoogleUser: async ({ role, firstName, lastName, email, appLanguage }) => {
    // Дозволені ролі для користувачів
    const validRoles = ['student', 'tutor', 'admin', 'superadmin']

    // Перевірка, чи роль користувача є валідною
    if (!validRoles.includes(role)) {
      throw createError(422, {
        message: 'The role you provided is invalid.',  // Повідомлення про помилку
        code: 'INVALID_ROLE'  // Код помилки
      })
    }

    // Перевірка, чи вже існує користувач з таким email
    const duplicateUser = await userService.getUserByEmail(email)
    if (duplicateUser) {
      throw createError(409, ALREADY_REGISTERED)  // Помилка, якщо користувач вже зареєстрований
    }

    // Створення нового користувача з переданими даними
    return await User.create({
      role: role,  // Прямо передаємо роль як строку
      firstName,  // Ім'я користувача
      lastName,   // Прізвище користувача
      email,      // Email користувача
      lastLoginAs: role,  // Вказуємо роль при останньому вході
      password: undefined,  // Для Google Auth пароль не потрібен
      appLanguage,  // Мова застосунку
      isEmailConfirmed: true,  // Для Google Auth email завжди підтверджений
      isGoogleAuth: true,  // Встановлюємо прапорець для Google Auth, щоб пароль не був обов'язковим
      status: {
        student: 'blocked',   // Статус "blocked" для ролі студент
        tutor: 'blocked',     // Статус "blocked" для ролі викладач
        admin: 'blocked',     // Статус "blocked" для ролі адміністратор
        [role]: 'active'   // Статус "active" для обраної ролі
      }
    })
  },



/*createUser: async (...args) => {
  let userData
  if (args.length === 1 && typeof args[0] === 'object') {
    // Если передан объект, используем его
    userData = args[0]
  } else if (args.length === 7) {
    // Если переданы отдельные параметры, создаём объект
    userData = {
      role: args[0],
      firstName: args[1],
      lastName: args[2],
      email: args[3],
      password: args[4],
      appLanguage: args[5],
      isEmailConfirmed: args[6]
    }

  }

  const { role, firstName, lastName, email, password, appLanguage, isEmailConfirmed = false } = userData

  const duplicateUser = await userService.getUserByEmail(email)
  if (duplicateUser) {
    throw createError(409, ALREADY_REGISTERED)
  }

  return await User.create({
    role,
    firstName,
    lastName,
    email,
    lastLoginAs: role,
    password,
    appLanguage,
    isEmailConfirmed
  })
},*/




  privateUpdateUser: async (id, param) => {
    const user = await User.findByIdAndUpdate(id, param, { new: true }).exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }
  },

  updateUser: async (id, role, updateData) => {
    const filteredUpdateData = filterAllowedFields(updateData, allowedUserFieldsForUpdate)

    const user = await User.findById(id).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }

    filteredUpdateData.mainSubjects = { ...user.mainSubjects, [role]: updateData.mainSubjects }

    await User.findByIdAndUpdate(id, filteredUpdateData, { new: true, runValidators: true }).lean().exec()
  },

  updateStatus: async (id, updateStatus) => {
    const statusesForChange = {}

    for (const role in updateStatus) {
      statusesForChange['status.' + role] = updateStatus[role]
    }

    const user = await User.findByIdAndUpdate(id, { $set: statusesForChange }, { new: true }).lean().exec()

    if (!user) {
      throw createError(404, DOCUMENT_NOT_FOUND([User.modelName]))
    }
  },

  deleteUser: async (id) => {
    await User.findByIdAndRemove(id).exec()
  }
}

module.exports = userService
