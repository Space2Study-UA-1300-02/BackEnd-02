const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const { expectError } = require('~/test/helpers')
const { OAuth2Client } = require('google-auth-library')
const { getUserByEmail, privateUpdateUser } = require('~/services/user')
const bcrypt = require('bcrypt')
const User = require('~/models/user') // Подключаем модель

// Сброс модулей и очистка моков перед тестами
jest.resetModules()
jest.clearAllMocks()

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: 'google.test@gmail.com',
        email_verified: true,
        given_name: 'John',
        family_name: 'Doe'
      })
    })
  }))
}))

describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
    console.log('🔍 Google OAuth мок активирован') // Проверка, что мок работает
  })

  beforeEach(async () => {
    await serverCleanup() // Очистка базы перед каждым тестом
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await stopServer(server)
    jest.resetAllMocks()
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@mail.com',
    password: 'testpass_135'
  }

  describe('Google Auth endpoint', () => {
    it('should preserve user data on subsequent logins', async () => {
      const firstResponse = await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      const user = await getUserByEmail(mockGooglePayload.email)

      if (!user) {
        throw new Error('User was not created on first login')
      }

      await privateUpdateUser(user._id, {
        professionalSummary: 'Test summary'
      })

      const response = await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      expect(response.status).toBe(200)

      const updatedUser = await getUserByEmail(mockGooglePayload.email)
      expect(updatedUser.professionalSummary).toBe('Test summary')
    })

    it('should successfully authenticate with Google credentials', async () => {
      const response = await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.headers['set-cookie'].some((cookie) => cookie.includes('refreshToken'))).toBe(true)
    })

    it('should create new user on first Google login', async () => {
      const response = await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      expect(response.status).toBe(200)

      const user = await getUserByEmail(mockGooglePayload.email)

      expect(user).toBeTruthy()
      expect(user.firstName).toBe(mockGooglePayload.given_name)
      expect(user.lastName).toBe(mockGooglePayload.family_name)
      expect(user.isEmailConfirmed).toBe(true)
      expect(user.role).toContain('student')
    })

    it('should update existing user on subsequent Google login', async () => {
      await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      const updatedPayload = {
        ...mockGooglePayload,
        given_name: 'Jane'
      }

      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => updatedPayload
        })
      }))

      await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken
      })

      const user = await getUserByEmail(mockGooglePayload.email)
      expect(user.firstName).toBe('Jane')
    })

    it('should fail with invalid Google token', async () => {
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
      }))

      const response = await app.post('/auth/google-auth').send({
        token: { credential: 'invalid.token' },
        role: 'student'
      })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        error: 'INVALID_GOOGLE_TOKEN',
        message: 'The Google token name you used is invalid.'
      })
    })


    it('should fail without token', async () => {
      const response = await app.post('/auth/google-auth').send({})
      expect(response.status).toBe(422)
    })

    it('should fail with invalid role', async () => {
      const response = await app.post('/auth/google-auth').send({
        token: mockValidGoogleToken,
        role: 'invalid_role'
      })

      expect(response.status).toBe(422)
    })
  })

  describe('Email confirmation endpoint', () => {
    let confirmToken
    let userId

    beforeEach(async () => {
      userId = signupResponse.body.userId

      const userBeforeToken = await getUserByEmail(user.email)
      console.log('User before token generation:', userBeforeToken)

      confirmToken = tokenService.generateConfirmToken({
        id: userId,
        role: user.role
      })
      await tokenService.saveToken(userId, confirmToken, 'confirmToken')

      console.log('Generated token:', confirmToken)
    })

    it('should successfully confirm email', async () => {
      const userBefore = await getUserByEmail(user.email)
      console.log('User before confirmation:', userBefore)

      const response = await app
        .get(`/auth/confirm-email/${confirmToken}`)

      console.log('Response status:', response.status)
      console.log('Response body:', response.body)

      expect(response.status).toBe(204)

      const updatedUser = await getUserByEmail(user.email)
      console.log('Updated user:', updatedUser)

      expect(updatedUser.isEmailConfirmed).toBe(true)
    })

    it('should fail with invalid token', async () => {
      const response = await app
        .get('/auth/confirm-email/invalid-token')

      expectError(400, errors.BAD_CONFIRM_TOKEN, response)
    })

    it('should fail if token not found in DB', async () => {
      await Token.deleteOne({ confirmToken })

      const response = await app
        .get(`/auth/confirm-email/${confirmToken}`)

      expectError(400, errors.BAD_CONFIRM_TOKEN, response)
    })

    it('should prevent login with unconfirmed email', async () => {
      const loginResponse = await app
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password
        })

      expectError(401, errors.EMAIL_NOT_CONFIRMED, loginResponse)
    })
  })

  describe('Signup endpoint', () => {
    it('should hash password before saving to database', async () => {
      const createdUser = await getUserByEmail(user.email);

      expect(createdUser).toBeTruthy()
      expect(createdUser.password).toBeDefined()
      expect(createdUser.password).not.toBe(user.password)

      const isPasswordValid = await bcrypt.compare(user.password, createdUser.password)
      expect(isPasswordValid).toBe(true)
    })

    it('should not store password in plain text', async () => {
      const createdUser = await getUserByEmail(user.email)
      expect(createdUser.password).not.toBe(user.password)
    })

    it('should throw validation errors for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = errors.FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation errors for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = errors.FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = errors.FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const signupResponse = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, signupResponse)
    })

    it('should throw validation errors for the password`s length', async () => {
      const responseForMax = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })

      const responseForMin = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = errors.FIELD_IS_NOT_OF_PROPER_LENGTH('password', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH
      })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw ALREADY_REGISTERED error', async () => {
      await app.post('/auth/signup').send(user)

      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    beforeEach(() => {
      const { firstName, email, role } = user

      resetToken = tokenService.generateResetToken({ id: signupResponse.body.userId, firstName, email, role })

      Token.findOne = jest.fn().mockResolvedValue({ save: jest.fn().mockResolvedValue(resetToken) })
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })

  describe('Login endpoint', () => {
    it('should authenticate user with correct credentials', async () => {
      const createdUser = await getUserByEmail(user.email);
      const userInstance = new User(createdUser); // Создаем экземпляр модели

      const isMatch = await userInstance.comparePassword(user.password);
      expect(isMatch).toBe(true); // Проверяем, совпадает ли пароль с хешем в базе

      const loginResponse = await app.post('/auth/login').send({
        email: user.email,
        password: user.password
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
    });


  it('should not authenticate user with incorrect password', async () => {
      const loginResponse = await app.post('/auth/login').send({
        email: user.email,
        password: 'wrongpassword' // Отправляем неверный пароль
      });

      expectError(401, errors.INVALID_CREDENTIALS, loginResponse); // Ожидаем ошибку 401
    });

    it('should return error for non-existent user', async () => {
      const loginResponse = await app.post('/auth/login').send({
        email: 'nonexistent@gmail.com',
        password: 'testpass_135'
      });

      expectError(404, errors.USER_NOT_FOUND, loginResponse); // Ожидаем ошибку 404, так как пользователя нет
    });
  });



  describe('Password comparison', () => {
    it('should return true for correct password', async () => {
      const userData = await getUserByEmail(user.email);
      const createdUser = new User(userData); // Преобразуем в модель

      const isMatch = await createdUser.comparePassword(user.password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const userData = await getUserByEmail(user.email);
      const createdUser = new User(userData);

      const isMatch = await createdUser.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });



})
