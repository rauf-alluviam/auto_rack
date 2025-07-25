import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My App API',
      version: '1.0.0',
    },
  },
  apis: ['./app/api/**/*.ts'], // <== include all route files
};

export async function getApiDocs() {
  const spec = swaggerJsdoc(options);
  return spec;
}
