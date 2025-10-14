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
    const basePath = (event && event.requestContext && event.requestContext.stage)
      ? `/${event.requestContext.stage}`
      : '';
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
            // Compute OpenAPI URL relative to deployed stage
            var basePath = '';
            try {
                var pathParts = window.location.pathname.split('/');
                if (pathParts.length > 1 && pathParts[1]) {
                    basePath = '/' + pathParts[1];
                }
            } catch (e) {}
            var openApiUrl = basePath + '/v1/openapi.yaml';
            
            const ui = SwaggerUIBundle({
                url: openApiUrl,
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
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // Add API key to requests
                    const apiKey = '${process.env.API_KEY || '858923c0cff4df1c4415f2493500ad37'}';
                    if (apiKey && !request.headers['X-API-Key']) {
                        request.headers['X-API-Key'] = apiKey;
                    }
                    // Ensure CORS headers
                    request.headers['Accept'] = 'application/json';
                    request.headers['Content-Type'] = 'application/json';
                    return request;
                },
                responseInterceptor: function(response) {
                    return response;
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
