const User = require('~/models/user')

const testUserAuthentication = async (app, testUser = {}) => {
  const qtyOfMandatorySignupFields = 5
  if (Object.keys(testUser).length < qtyOfMandatorySignupFields) {
    testUser = {
      role: testUser.role ? testUser.role : 'student',
      firstName: 'Tart',
      lastName: 'Drilling',
      email: 'tartdrilling@gmail.com',
      password: 'Qwerty123@',
      FAQ: { student: [{ question: 'question1', answer: 'answer1' }] },
      isEmailConfirmed: true,
      lastLoginAs: testUser.role ? testUser.role : 'student'
    }
  }

  await User.create({ ...testUser })

  const loginUserResponse = await app.post('/auth/login').send({ email: testUser.email, password: testUser.password })

  return loginUserResponse.body.accessToken
}

module.exports = testUserAuthentication
