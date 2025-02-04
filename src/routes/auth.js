const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const validationMiddleware = require('~/middlewares/validation')
const langMiddleware = require('~/middlewares/appLanguage')

const authController = require('~/controllers/auth')
const signupValidationSchema = require('~/validation/schemas/signup')
const { loginValidationSchema } = require('~/validation/schemas/login')
const resetPasswordValidationSchema = require('~/validation/schemas/resetPassword')
const forgotPasswordValidationSchema = require('~/validation/schemas/forgotPassword')

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: AAA
 *               lastName:
 *                 type: string
 *                 example: BBB
 *               email:
 *                 type: string
 *                 example: aabb@gmail.com
 *               password:
 *                 type: string
 *                 example: pass123
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation error
 */

router.post(
  '/signup',
  validationMiddleware(signupValidationSchema),
  langMiddleware,
  asyncWrapper(authController.signup)
)
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully signed in"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email and password are required."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials."
 */

router.post('/login', validationMiddleware(loginValidationSchema), asyncWrapper(authController.login))


/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: User successfully logged out (no content returned)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing refresh token."
 */


router.post(
  '/google-auth',
  langMiddleware,
  asyncWrapper(authController.googleAuth)
)

router.post('/logout', asyncWrapper(authController.logout))

/**
 * @swagger
 * /refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/refresh', asyncWrapper(authController.refreshAccessToken))

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/forgot-password',
  validationMiddleware(forgotPasswordValidationSchema),
  langMiddleware,
  asyncWrapper(authController.sendResetPasswordEmail)
)

/**
 * @swagger
 * /reset-password/{token}:
 *   patch:
 *     summary: Reset password using a token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 */
router.patch(
  '/reset-password/:token',
  validationMiddleware(resetPasswordValidationSchema),
  langMiddleware,
  asyncWrapper(authController.updatePassword)
)
router.get(
  '/confirm-email/:token',
  asyncWrapper(authController.confirmEmail)
)

module.exports = router
