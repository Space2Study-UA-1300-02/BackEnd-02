const authService = require('~/services/auth')
const { oneDayInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')
const {
  tokenNames: { REFRESH_TOKEN, ACCESS_TOKEN }
} = require('~/consts/auth')

const COOKIE_OPTIONS = {
  maxAge: oneDayInMs,
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: COOKIE_DOMAIN
}

const signup = async (req, res) => {
  const { role, firstName, lastName, email, password } = req.body
  const lang = req.lang

  const userData = await authService.signup(role, firstName, lastName, email, password, lang)

  res.status(201).json(userData)
}

const login = async (req, res) => {
  const { email, password } = req.body

  const tokens = await authService.login(email, password)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies

  await authService.logout(refreshToken)

  res.clearCookie(REFRESH_TOKEN)
  res.clearCookie(ACCESS_TOKEN)

  res.status(204).end()
}

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    res.clearCookie(ACCESS_TOKEN)

    return res.status(401).end()
  }

  const tokens = await authService.refreshAccessToken(refreshToken)

  res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body
  const lang = req.lang

  await authService.sendResetPasswordEmail(email, lang)

  res.status(204).end()
}

const updatePassword = async (req, res) => {
  const { password } = req.body
  const resetToken = req.params.token
  const lang = req.lang

  await authService.updatePassword(resetToken, password, lang)

  res.status(204).end()
}

const authGoogle = async (req, res) => {
  try {
    const { token, role } = req.body // Получаем токен и роль
    const lang = req.lang // Язык из запроса

    // Проверка на наличие необходимых данных в теле запроса
    if (!token || !token.credential) {
      return res.status(400).json({ message: 'Google token is required' })
    }

    // Вызов сервиса для аутентификации через Google
    const tokens = await authService.googleAuth(token.credential, role, lang)

    // Сохраняем токены в cookies
    res.cookie(ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
    res.cookie(REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

    // Удаляем refreshToken из объекта, чтобы не отправить его в ответ
    delete tokens.refreshToken

    // Отправляем только accessToken в ответе
    return res.status(200).json(tokens)
  } catch (error) {
    console.error('Google authentication error:', error.message)

    // Обрабатываем ошибки и отправляем соответствующий ответ
    if (error.response) {
      // Ошибка от сервиса Google
      return res.status(500).json({ message: 'Google authentication service error', error: error.message })
    }

    // Общая ошибка
    return res.status(500).json({ message: 'An unexpected error occurred during Google authentication', error: error.message })
  }
}


module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  sendResetPasswordEmail,
  updatePassword,
  authGoogle // Добавили новый метод для Google логина

}
