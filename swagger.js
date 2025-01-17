const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'My API', // API title
      version: '1.0.0', // API version
      description: 'API documentation for my Node.js project' // API description
    },
    servers: [
      {
        url: 'http://localhost:3000', // Server URL
        description: 'Development server'
      }
    ]
  },
  // Path to the API docs
  apis: ['./routes/*.js'] // Adjust this path to your routes
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)) // Swagger UI available at /api-docs
}
