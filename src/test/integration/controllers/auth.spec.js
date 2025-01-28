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

// Мокаем google-auth-library
jest.mock('google-auth-library')

describe('Auth controller', () => {
  let app, server, signupResponse

  // Моки для Google Auth
  const mockGooglePayload = {
    email: 'test@gmail.com',
    email_verified: true,
    given_name: 'John',
    family_name: 'Doe'
  }

  const mockValidGoogleToken = {
    credential: 'valid.google.token'
  }

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())

    // Настраиваем моки для Google OAuth2Client
    OAuth2Client.mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => mockGooglePayload
      })
    }))
  })

  beforeEach(async () => {
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
    email: 'test@gmail.com',
    password: 'testpass_135'
  }

  describe('Signup endpoint', () => {
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


  describe('Google Auth endpoint', () => {
    it('should successfully authenticate with Google credentials', async () => {
      const response = await app
        .post('/auth/google-login')
        .send({ token: mockValidGoogleToken,
          role: 'student'})

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.headers['set-cookie'].some(cookie => cookie.includes('refreshToken'))).toBe(true)
    })

    it('should create new user on first Google login', async () => {
      const response = await app
        .post('/auth/google-login')
        .send({
          token: mockValidGoogleToken,
          role: 'student'
        })

      expect(response.status).toBe(200)

      // Проверяем, что пользователь создан с правильными данными
      const user = await getUserByEmail(mockGooglePayload.email)
      expect(user).toBeTruthy()
      expect(user.firstName).toBe(mockGooglePayload.given_name)
      expect(user.lastName).toBe(mockGooglePayload.family_name)
      expect(user.isEmailConfirmed).toBe(true)
      expect(user.role).toContain('student')
    })

    it('should update existing user on subsequent Google login', async () => {
      // Сначала создаем пользователя через Google Auth
      await app
        .post('/auth/google-login')
        .send({ token: mockValidGoogleToken })

      // Меняем имя в моке Google payload
      const updatedPayload = {
        ...mockGooglePayload,
        given_name: 'Jane'
      }

      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => updatedPayload
        })
      }))

      // Повторный вход
      await app
        .post('/auth/google-login')
        .send({
          token: mockValidGoogleToken
        })

      // Проверяем обновление данных
      const user = await getUserByEmail(mockGooglePayload.email)
      expect(user.firstName).toBe('Jane')
    })

    it('should fail with invalid Google token', async () => {
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
      }))

      const response = await app
        .post('/auth/google-login')
        .send({
          token: { credential: 'invalid.token' },
          role: 'student'
        })

      expectError(400, errors.INVALID_GOOGLE_TOKEN, response)
    })

    it('should fail when email is not verified', async () => {
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            ...mockGooglePayload,
            email_verified: false
          })
        })
      }))

      const response = await app
        .post('/auth/google-login')
        .send({ token: mockValidGoogleToken,
          role: 'student'})

      expectError(401, errors.EMAIL_NOT_CONFIRMED, response)
    })

    it('should fail without token', async () => {
      const response = await app
        .post('/auth/google-login')
        .send({})

      expect(response.status).toBe(422)
    })

    it('should fail with invalid role', async () => {
      const response = await app
        .post('/auth/google-login')
        .send({
          token: mockValidGoogleToken,
          role: 'invalid_role'
        })

      expect(response.status).toBe(422)
    })

    it('should preserve user data on subsequent logins', async () => {
      // Первый вход создает пользователя
      await app
        .post('/auth/google-login')
        .send({
          token: mockValidGoogleToken,
          role: 'student'
        })

      // Модифицируем данные пользователя
      const user = await getUserByEmail(mockGooglePayload.email)
      await privateUpdateUser(user._id, {
        professionalSummary: 'Test summary'
      })

      // Повторный вход
      await app
        .post('/auth/google-login')
        .send({ token: mockValidGoogleToken })

      // Проверяем, что данные сохранились
      const updatedUser = await getUserByEmail(mockGooglePayload.email)
      expect(updatedUser.professionalSummary).toBe('Test summary')
    })
  })
})
