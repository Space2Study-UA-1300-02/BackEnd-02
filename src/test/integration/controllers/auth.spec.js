// Підключаємо основні функції для роботи з тестовим сервером
// serverInit - запускає сервер для тестів
// serverCleanup - очищує дані після тестів
// stopServer - зупиняє тестовий сервер
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')

// Імпортуємо константи для перевірки паролів та ролей користувачів
// lengths містить мінімальну та максимальну довжину пароля
// ROLE_ENUM містить список дозволених ролей користувачів
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')

// Підключаємо об'єкт, що містить всі можливі помилки в системі
const errors = require('~/consts/errors')

// Підключаємо сервіс для роботи з токенами автентифікації
const tokenService = require('~/services/token')

// Підключаємо модель даних для токенів
const Token = require('~/models/token')

// Імпортуємо спеціальну функцію для тестування помилок
const { expectError } = require('~/test/helpers')

// Підключаємо клієнт Google для авторизації користувачів через Google
const { OAuth2Client } = require('google-auth-library')

// Імпортуємо функції для роботи з користувачами:
// getUserByEmail - знаходить користувача за email
// privateUpdateUser - оновлює дані користувача
const { getUserByEmail, privateUpdateUser } = require('~/services/user')

// Створюємо фейковий (мок) об'єкт для Google авторизації
// Це потрібно, щоб не робити реальні запити до Google під час тестів
jest.mock('google-auth-library')

// Початок основного блоку тестів для системи автентифікації
describe('Auth controller', () => {
  // Оголошуємо змінні, які будуть доступні у всіх тестах:
  // app - екземпляр тестового додатку
  // server - екземпляр тестового сервера
  // signupResponse - відповідь на запит реєстрації
  let app, server, signupResponse

  // Створюємо тестові дані для імітації відповіді від Google
  // Це об'єкт, який містить базову інформацію про користувача Google
  const mockGooglePayload = {
    email: 'google.test@gmail.com',   // Email користувача
    email_verified: true,             // Прапорець, що email підтверджений
    given_name: 'John',               // Ім'я користувача
    family_name: 'Doe'                // Прізвище користувача
  }

  // Створюємо фейковий токен Google для тестів
  const mockValidGoogleToken = {
    credential: 'valid.google.token'  // Тестовий токен автентифікації
  }

  // Функція, яка виконується один раз перед усіма тестами
  beforeAll(async () => {
    // Запускаємо тестовий сервер і зберігаємо посилання на нього
    ; ({ app, server } = await serverInit())

    // Налаштовуємо мок для Google автентифікації
    // Це створює фейкову версію Google клієнта, яка завжди повертає наші тестові дані
    OAuth2Client.mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => mockGooglePayload
      })
    }))
  })

  // Функція, яка виконується перед кожним окремим тестом
  beforeEach(async () => {
    // Реєструємо нового користувача перед кожним тестом
    signupResponse = await app.post('/auth/signup').send(user)
  })

  // Функція, яка виконується після кожного тесту
  afterEach(async () => {
    // Очищуємо базу даних
    await serverCleanup()
    // Очищуємо всі моки (фейкові об'єкти)
    jest.clearAllMocks()
  })

  // Функція, яка виконується після всіх тестів
  afterAll(async () => {
    // Зупиняємо тестовий сервер
    await stopServer(server)
    // Повністю скидаємо всі моки
    jest.resetAllMocks()
  })

  // Створюємо тестового користувача з базовими даними
  const user = {
    role: 'student',                  // Роль користувача
    firstName: 'test',                // Ім'я
    lastName: 'test',                 // Прізвище
    email: 'test@gmail.com',          // Email
    password: 'testpass_135'          // Пароль
  }

  // Починаємо групу тестів для Google автентифікації
  describe('Google Auth endpoint', () => {
    // Тест перевіряє, чи зберігаються дані користувача при повторному вході
    it('should preserve user data on subsequent logins', async () => {
      // Спочатку робимо перший вхід, який має створити користувача
      const firstResponse = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,   // Відправляємо токен
        role: 'student'                // І вказуємо роль
      })

      // Виводимо в консоль відповідь від сервера для налагодження
      console.log('First login response:', firstResponse.body)

      // Шукаємо створеного користувача в базі даних за email
      const user = await getUserByEmail(mockGooglePayload.email)
      // Виводимо знайденого користувача для налагодження
      console.log('User after first login:', user)

      // Перевіряємо, чи користувач був створений
      if (!user) {
        throw new Error('User was not created on first login')
      }

      // Оновлюємо профіль користувача, додаючи професійне резюме
      await privateUpdateUser(user._id, {
        professionalSummary: 'Test summary'
      })

      // Робимо повторний вхід
      const response = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      // Перевіряємо, що сервер відповів успішно
      expect(response.status).toBe(200)

      // Отримуємо оновлені дані користувача
      const updatedUser = await getUserByEmail(mockGooglePayload.email)
      // Перевіряємо, що професійне резюме збереглося
      expect(updatedUser.professionalSummary).toBe('Test summary')
    })

    // Тест перевіряє успішну автентифікацію через Google
    it('should successfully authenticate with Google credentials', async () => {
      // Відправляємо запит на вхід через Google
      const response = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,   // Токен Google
        role: 'student'                // Роль користувача
      })

      // Перевіряємо успішність відповіді
      expect(response.status).toBe(200)
      // Перевіряємо наявність токену доступу у відповіді
      expect(response.body).toHaveProperty('accessToken')
      // Перевіряємо, що в куках є токен оновлення
      expect(response.headers['set-cookie'].some((cookie) => cookie.includes('refreshToken'))).toBe(true)
    })

    // Тест перевіряє створення нового користувача при першому вході через Google
    it('should create new user on first Google login', async () => {
      // Робимо запит на вхід через Google
      const response = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      // Виводимо деталі відповіді для налагодження
      console.log('Response Body:', response.body)
      console.log('Response Status:', response.status)

      // Перевіряємо успішність запиту
      expect(response.status).toBe(200)

      // Шукаємо створеного користувача в базі
      const user = await getUserByEmail(mockGooglePayload.email)
      // Виводимо дані користувача для налагодження
      console.log('Created User:', user)

      // Перевіряємо, що користувач існує
      expect(user).toBeTruthy()
      // Перевіряємо, що ім'я співпадає з даними від Google
      expect(user.firstName).toBe(mockGooglePayload.given_name)
      // Перевіряємо прізвище
      expect(user.lastName).toBe(mockGooglePayload.family_name)
      // Перевіряємо, що email підтверджений
      expect(user.isEmailConfirmed).toBe(true)
      // Перевіряємо, що роль встановлена правильно
      expect(user.role).toContain('student')
    })

    // Тест перевіряє оновлення даних користувача при повторному вході
    it('should update existing user on subsequent Google login', async () => {
      // Спочатку створюємо користувача першим входом
      await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      // Створюємо нові тестові дані з іншим іменем
      const updatedPayload = {
        ...mockGooglePayload,          // Копіюємо всі старі дані
        given_name: 'Jane'             // Змінюємо ім'я
      }
      // Виводимо нові дані для налагодження
      console.log('test updatedPayload:', updatedPayload)

      // Оновлюємо мок Google клієнта, щоб він повертав нові дані
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => updatedPayload
        })
      }))

      // Робимо повторний вхід
      await app.post('/auth/google-login').send({
        token: mockValidGoogleToken
      })

      // Перевіряємо, що дані користувача оновилися
      const user = await getUserByEmail(mockGooglePayload.email)
      expect(user.firstName).toBe('Jane')
    })

    // Тест перевіряє помилку при невалідному токені Google
    it('should fail with invalid Google token', async () => {
      // Налаштовуємо мок Google клієнта на повернення помилки
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
      }))

      // Намагаємося увійти з неправильним токеном
      const response = await app.post('/auth/google-login').send({
        token: { credential: 'invalid.token' },
        role: 'student'
      })

      // Перевіряємо статус помилки
      expect(response.status).toBe(401)
      // Перевіряємо структуру повідомлення про помилку
      expect(response.body).toEqual({
        error: 'INVALID_GOOGLE_TOKEN',
        message: 'The Google token name you used is invalid.'
      })
    })

    // Тест перевіряє помилку при неверифікованому email
    it('should fail when email is not verified', async () => {
      // Налаштовуємо мок Google клієнта на повернення неверифікованого email
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            ...mockGooglePayload,
            email_verified: false    // Встановлюємо прапорець верифікації в false
          })
        })
      }))

      // Намагаємося увійти
      const response = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,
        role: 'student'
      })

      // Перевіряємо статус помилки
      expect(response.status).toBe(401)
      // Перевіряємо повідомлення про помилку
      expect(response.body).toEqual({
        error: 'EMAIL_NOT_CONFIRMED',
        message: 'Please confirm your email to login.'
      })
    })

    // Тест перевіряє помилку при відсутності токена
    it('should fail without token', async () => {
      // Відправляємо порожній запит
      const response = await app.post('/auth/google-login').send({})
      // Перевіряємо статус помилки валідації
      expect(response.status).toBe(422)
    })

    // Тест перевіряє помилку при неправильній ролі користувача
    it('should fail with invalid role', async () => {
      // Намагаємося увійти з неіснуючою роллю
      const response = await app.post('/auth/google-login').send({
        token: mockValidGoogleToken,
        role: 'invalid_role'          // Неправильна роль
      })

      // Виводимо деталі відповіді для налагодження
      console.log('Response status:', response.status)
      console.log('Response body:', response.body)

      // Перевіряємо статус помилки валідації
      expect(response.status).toBe(422)
    })
  })


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


})
