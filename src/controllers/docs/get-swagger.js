const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { bodyResponse } = require('../../../helpers/http/body-response');
const { OK_CODE } = require('../../../enums/http/status-code');

/**
 * Get Swagger UI documentation
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} Swagger UI HTML response
 */
const getSwagger = async (event, context) => {
  try {
    // Load OpenAPI specification
    const openApiPath = path.resolve(__dirname, '../../../openapi.yaml');
    const swaggerDocument = YAML.load(openApiPath);
    
    // Generate Swagger UI HTML
    const swaggerUiHtml = swaggerUi.generateHTML(swaggerDocument, {
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #3b82f6; }
        .swagger-ui .scheme-container { background: #f8fafc; }
        .swagger-ui .btn.authorize { background-color: #3b82f6; }
        .swagger-ui .btn.authorize:hover { background-color: #2563eb; }
      `,
      customSiteTitle: "OpenWeather Microservice API",
      customfavIcon: "/favicon.ico",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
          // Add API key to requests if available
          const apiKey = process.env.API_KEY;
          if (apiKey && !req.headers['X-API-Key']) {
            req.headers['X-API-Key'] = apiKey;
          }
          // Ensure requests go to the correct base URL
          if (req.url && !req.url.startsWith('http')) {
            req.url = `http://localhost:4000/v1${req.url}`;
          }
          return req;
        }
      }
    });

    return {
      statusCode: OK_CODE,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      },
      body: swaggerUiHtml
    };

  } catch (error) {
    console.error('Error generating Swagger UI:', error);
    
    return bodyResponse({
      statusCode: 500,
      body: {
        error: 'SWAGGER_ERROR',
        message: 'Failed to generate API documentation',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message
        }
      }
    });
  }
};

module.exports = { getSwagger };
