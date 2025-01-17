require('module-alias/register')
require('../module-aliases')
require('~/initialization/envSetup')
const express = require('express')
const serverSetup = require('~/initialization/serverSetup')
const logger = require('~/logger/logger')
const swaggerSetup = require('./swagger')

const app = express()

swaggerSetup(app)

const start = async () => {
  try {
    await serverSetup(app)
  } catch (err) {
    logger.error(err)
  }
}

start()
