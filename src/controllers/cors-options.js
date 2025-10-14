const { bodyResponse } = require('../helpers/http/body-response');
const { OK_CODE } = require('../enums/http/status-code');

/**
 * CORS OPTIONS handler for preflight requests
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} CORS preflight response
 */
const corsOptions = async (event, context) => {
  try {
    return {
      statusCode: OK_CODE,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  } catch (error) {
    console.error('Error in CORS OPTIONS handler:', error);
    
    return bodyResponse({
      statusCode: 500,
      body: {
        error: 'CORS_ERROR',
        message: 'Failed to handle CORS preflight request',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message
        }
      }
    });
  }
};

module.exports = { 
  corsOptions,
  handler: corsOptions
};
