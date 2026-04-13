import swaggerJsdoc from 'swagger-jsdoc';
import { serverConfig } from './server.config';

const swaggerDefinition: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BeGoodIt API',
      version: '1.0.0',
      description: 'Image handling and processing API',
    },
    servers: serverConfig.servers,
  },
  apis: ['./src/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerDefinition);
