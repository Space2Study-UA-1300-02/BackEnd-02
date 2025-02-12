const router = require('express').Router()
const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
/*const validationMiddleware = require('~/middlewares/validation')*/ //на етапе тестирование отключено
const categoryController = require('~/controllers/category')

// Применяем middleware аутентификации
/*router.use(authMiddleware)*/ //на етапе тестирование отключено

// Маршрут доступен для пользователей с соответствующей ролью
router.get('/', asyncWrapper(categoryController.getCategories))      // Получить все категории
router.post('/', asyncWrapper(categoryController.createCategory))    // Создать категорию
router.patch('/:id', asyncWrapper(categoryController.updateCategory)) // Обновить категорию
router.delete('/:id', asyncWrapper(categoryController.deleteCategory)) // Удалить категорию
router.get('/names', categoryController.getCategoryNames)  // Для получения имен категорий
router.get('/:id', asyncWrapper(categoryController.getCategoryById)) // Получить категорию по ID


module.exports = router
