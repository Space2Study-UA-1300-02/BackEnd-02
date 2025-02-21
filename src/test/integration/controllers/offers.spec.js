const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const errors = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const User = require('~/models/user')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const Subject = require('~/models/subject')

jest.mock('~/middlewares/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = {
      id: 'mockedUserId',
      role: 'tutor' // Даем админские права
    }
    next()
  },
  restrictTo: (...roles) => (req, res, next) => next() // Пропускаем без проверки
}))


jest.mock('~/services/token', () => ({
  generateToken: jest.fn().mockReturnValue('mockedAccessToken'),
  verifyToken: jest.fn().mockReturnValue({ id: 'mockedUserId', role: 'tutor' }),
  saveToken: jest.fn(),
  removeToken: jest.fn()
}))

describe('Offer controller', () => {
  let app, server, testContext

  const testCategory = {
    name: 'Mathematics',
    appearance: { color: '#FF0000' }
  }

  const testSubject = {
    name: 'Algebra',
    categoryId: 1
  }

  const testOffer = {
    price: 100,
    proficiencyLevel: 'Beginner',
    title: 'Test Offer',
    description: 'Test Description',
    languages: ['English'],
    authorRole: 'tutor',
    status: 'active'
  }

  beforeAll(async () => {
    ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    const category = await Category.create(testCategory)
    const subject = await Subject.create(testSubject)

    const offerResponse = await app.post('/offers')
      .send({
        ...testOffer,
        author: 'mockedUserId',
        category: category._id,
        subject: subject._id
      })
    expect(offerResponse.status).toBe(201)

    testContext = {
      authorAccessToken: 'mockedAccessToken',
      userAccessToken: 'mockedAccessToken',
      offerId: offerResponse.body._id
    }
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('Access control', () => {
    it('should not allow non-involved user to update the offer', async () => {
      const response = await app
        .patch(`/offers/${testContext.offerId}`)
        .send({ title: 'Updated Title' })
        .set('Authorization', `Bearer ${testContext.userAccessToken}`)

      expectError(403, errors.FORBIDDEN, response)
    })

    it('should not allow non-involved user to delete the offer', async () => {
      const response = await app
        .delete(`/offers/${testContext.offerId}`)
        .set('Authorization', `Bearer ${testContext.userAccessToken}`)

      expectError(403, errors.FORBIDDEN, response)
    })
  })
})
