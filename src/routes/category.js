const router = require('express').Router()
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
/*const validationMiddleware = require('~/middlewares/validation')*/ //на етапе тестирование отключено
const categoryController = require('~/controllers/category')

// Применяем middleware аутентификации
/*router.use(authMiddleware)*/ //на етапе тестирование отключено

// Маршрут доступен для пользователей с соответствующей ролью
router.get('/', asyncWrapper(categoryController.getCategories))
router.post('/', asyncWrapper(categoryController.createCategory))
router.patch('/:id', asyncWrapper(categoryController.updateCategory))
router.delete('/:id', asyncWrapper(categoryController.deleteCategory))
router.get('/names', categoryController.getCategoryNames)
router.get('/:id', asyncWrapper(categoryController.getCategoryById))


module.exports = router
