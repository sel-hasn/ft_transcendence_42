import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FT_Transcendence API',
            version: '1.0.0',
            description: 'API documentation for the FT_Transcendence project',
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api`,
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },

    },
    apis: ['./src/routes/*.ts', './src/schemas/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
