const fs = require('fs');
const path = require('path');
const { bodyResponse } = require('../../helpers/http/body-response');
const { OK_CODE } = require('../../enums/http/status-code');

/**
 * Get OpenAPI YAML specification
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} OpenAPI YAML response
 */
const getOpenAPI = async (event, context) => {
  try {
    // Load OpenAPI specification
    const openApiPath = path.resolve(__dirname, '../../../openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');

    return {
      statusCode: OK_CODE,
      headers: {
        'Content-Type': 'application/x-yaml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      },
      body: openApiContent
    };

  } catch (error) {
    console.error('Error loading OpenAPI specification:', error);
    
    return bodyResponse({
      statusCode: 500,
      body: {
        error: 'OPENAPI_ERROR',
        message: 'Failed to load API specification',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message
        }
      }
    });
  }
};

module.exports = { 
  getOpenAPI,
  handler: getOpenAPI
};
