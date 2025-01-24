require('module-alias/register')
require('../module-aliases')
require('~/initialization/envSetup')
require('dotenv').config()
const express = require('express')
const serverSetup = require('~/initialization/serverSetup')
const logger = require('~/logger/logger')

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const app = express()
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`)
})

const start = async () => {
  try {
    await serverSetup(app)
  } catch (err) {
    logger.error(err)
  }
}

start()
