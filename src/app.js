require('module-alias/register')
require('../module-aliases')
require('~/initialization/envSetup')
require('dotenv').config()
const express = require('express')
const serverSetup = require('~/initialization/serverSetup')
const logger = require('~/logger/logger')

const app = express()


const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const start = async () => {
  try {
    await serverSetup(app, { swaggerUi, swaggerSpec })
  } catch (err) {
    logger.error(err)
  }
}

start()
