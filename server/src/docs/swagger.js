import  swaggerJSDoc  from 'swagger-jsdoc';
import path from 'path';

const __dirname = path.resolve();

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Modern API docs',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
  apis: [ path.join(__dirname, '../routes/*.js')],
});