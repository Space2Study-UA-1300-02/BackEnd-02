const databaseInitialization = require('~/initialization/database')
const checkUserExistence = require('~/seed/checkUserExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const {
  config: { SERVER_PORT }
} = require('~/configs/config')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

const serverSetup = async (app, { swaggerUi, swaggerSpec } = {}) => {
  await databaseInitialization()
  await checkUserExistence()

  if (swaggerUi && swaggerSpec) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  }

  initialization(app)

  const server = app.listen(SERVER_PORT, () => {
    logger.info(`Server is running on http://localhost:${SERVER_PORT}/`)
    if (swaggerUi) {
      logger.info(`Swagger UI: http://localhost:${SERVER_PORT}/api-docs`)
    }
    if (process.env.NODE_ENV !== 'test') {
      scheduledCronJobs()
    }
  })

  return server
}

module.exports = serverSetup
