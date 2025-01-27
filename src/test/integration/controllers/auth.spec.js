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
jest.mock('google-auth-library') // Мокаем Google OAuth2Client





describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
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

  const authService = require('~/services/auth'); // Импортируем authService, если это функция
  jest.mock('~/services/auth', () => jest.fn()); // Мокаем authService как функцию
  describe('Google Login endpoint', () => {
    let mockVerifyIdToken;

    beforeAll(() => {
      mockVerifyIdToken = jest.fn();
      OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully login a user with valid Google ID token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@example.com',
          given_name: 'John',
          family_name: 'Doe',
        }),
      });

      // Замокируем поведение функции authService
      authService.mockResolvedValue({
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
      });

      const validIdToken = 'valid-google-id-token';
      const response = await app.post('/auth/google-login').send({ idToken: validIdToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should create a new user if one does not exist', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'newuser@example.com',
          given_name: 'Jane',
          family_name: 'Doe',
        }),
      });

      const newUserId = 'new-user-id';
      const validIdToken = 'valid-google-id-token';

      const createUserMock = jest.fn().mockResolvedValue({ _id: newUserId });
      const loginMock = jest.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Замокируем поведение authService для создания пользователя и логина
      authService.mockImplementationOnce(createUserMock).mockImplementationOnce(loginMock);

      const response = await app.post('/auth/google-login').send({ idToken: validIdToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(createUserMock).toHaveBeenCalledWith(
        'Jane', // first name
        'Doe',  // last name
        'newuser@example.com', // email
        null,   // password (не используется)
        true    // email confirmed
      );
      expect(loginMock).toHaveBeenCalledWith('newuser@example.com', null, true);
    });

    it('should throw an error for invalid Google ID token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid ID token'));

      const invalidIdToken = 'invalid-google-id-token';
      const response = await app.post('/auth/google-login').send({ idToken: invalidIdToken });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid ID token');
    });

    it('should throw an error if user does not exist in the database', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'nonexistentuser@example.com',
          given_name: 'Nonexistent',
          family_name: 'User',
        }),
      });

      const nonExistentIdToken = 'nonexistent-google-id-token';
      const response = await app.post('/auth/google-login').send({ idToken: nonExistentIdToken });

      expect(response.status).toBe(200); // Ответ будет успешным, так как пользователь создается
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });
})
