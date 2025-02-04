const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node JS API for Authentication',
      version: '1.0.0'
    },
    components: {
      schemas: {
        Signup: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'password123' },
            role: { type: 'string', example: 'user' }
          },
          required: ['firstName', 'lastName', 'email', 'password', 'role']
        },
        Login: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'password123' }
          },
          required: ['email', 'password']
        },
        ForgotPassword: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'john.doe@example.com' }
          },
          required: ['email']
        },
        ResetPassword: {
          type: 'object',
          properties: {
            password: { type: 'string', example: 'newpassword123' },
            confirmPassword: { type: 'string', example: 'newpassword123' }
          },
          required: ['password', 'confirmPassword']
        }
      }
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Local server'
      }
    ]
  },
  apis: ['./routes/auth.js']
}

const swaggerSpec = swaggerJSDoc(options)

module.exports = swaggerSpec
