const router = require('express').Router()
const subjectController = require('~/controllers/subject')
const asyncWrapper = require('~/middlewares/asyncWrapper')

/*const { authMiddleware } = require('~/middlewares/auth')*/
/*const validationMiddleware = require('~/middlewares/validation')*/ //на етапе тестирование отключено

// Применяем middleware аутентификации
/*router.use(authMiddleware)*/ //на етапе тестирование отключено

// Маршрут доступен для пользователей с соответствующей ролью
router.get('/', asyncWrapper(subjectController.getSubjects))
router.get('/names', asyncWrapper(subjectController.getSubjectNames))
router.get('/:id', asyncWrapper(subjectController.getSubjectById))
router.get('/category/:categoryId', asyncWrapper(subjectController.getSubjectsByCategoryId))
router.post('/', asyncWrapper(subjectController.createSubject))
router.patch('/:id', asyncWrapper(subjectController.updateSubject))
router.delete('/:id', asyncWrapper(subjectController.deleteSubject))


module.exports = router
