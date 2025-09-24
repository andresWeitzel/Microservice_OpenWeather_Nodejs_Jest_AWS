const { bodyResponse } = require('../../helpers/http/body-response');
const { OK_CODE } = require('../../enums/http/status-code');

/**
 * Simple Swagger UI endpoint
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} Swagger UI HTML response
 */
const getSwaggerUI = async (event, context) => {
  try {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenWeather Microservice API</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/dev/v1/openapi.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                requestInterceptor: function(request) {
                    // Add API key to requests
                    const apiKey = '${process.env.API_KEY || 'your-api-key-here'}';
                    if (apiKey && !request.headers['X-API-Key']) {
                        request.headers['X-API-Key'] = apiKey;
                    }
                    return request;
                }
            });
        };
    </script>
</body>
</html>`;

    return {
      statusCode: OK_CODE,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      },
      body: swaggerHtml
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

module.exports = { 
  getSwaggerUI,
  handler: getSwaggerUI
};
