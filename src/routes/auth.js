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


/**
 * @swagger
 * /confirm-email/{token}:
 *   get:
 *     summary: User email confirmation
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email confirmation token
 *     responses:
 *       204:
 *         description: Email successfully confirmed
 *       400:
 *         description: Invalid or expired confirmation token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: BAD_CONFIRM_TOKEN
 *                 message:
 *                   type: string
 *                   example: The confirmation token is invalid or has expired.
 */

router.get(
  '/confirm-email/:token',
  asyncWrapper(authController.confirmEmail)
)

/**
 * @swagger
 * /auth/google-auth:
 *   post:
 *     summary: Authentication via Google OAuth
 *     description: Allows users to log in or register via Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - role
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token (JWT)
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               role:
 *                 type: string
 *                 description: User role
 *                 enum:
 *                   - student
 *                   - tutor
 *                   - admin
 *                   - superadmin
 *                 example: student
 *     responses:
 *       200:
 *         description: Successful authentication via Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token for the user
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isFirstLogin:
 *                   type: boolean
 *                   description: Whether this is the user's first login
 *                   example: true
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               oneOf:
 *                 - properties:
 *                     error:
 *                       type: string
 *                       example: "INVALID_GOOGLE_TOKEN"
 *                     message:
 *                       type: string
 *                       example: "The provided Google token is invalid."
 *                 - properties:
 *                     error:
 *                       type: string
 *                       example: "EMAIL_NOT_CONFIRMED"
 *                     message:
 *                       type: string
 *                       example: "Please confirm your email before logging in."
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user role."
 *                 error:
 *                   type: string
 *                   example: "INVALID_ROLE"
 *     security:
 *       - GoogleAuth: []
 */



router.post(
  '/google-auth',
  langMiddleware,
  asyncWrapper(authController.googleAuth)
)

module.exports = router
