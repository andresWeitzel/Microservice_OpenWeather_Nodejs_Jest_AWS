# OpenWeather Microservice API Documentation

## 🚀 Overview

This microservice provides a comprehensive weather API with real-time data, forecasts, and enhanced features. It's built with Node.js, Jest for testing, and designed for AWS deployment.

## 📋 Table of Contents

*   [Features](#features)
*   [API Endpoints](#api-endpoints)
*   [Authentication](#authentication)
*   [Rate Limiting](#rate-limiting)
*   [Error Handling](#error-handling)
*   [Response Formats](#response-formats)
*   [Examples](#examples)
*   [Testing](#testing)
*   [Deployment](#deployment)

## ✨ Features

*   **Real-time Weather Data**: Current weather conditions for any location
*   **Weather Forecasts**: 5-day weather forecasts with detailed analysis
*   **City Search**: Find cities by name and country code
*   **Enhanced Data**: Additional metrics and insights
*   **Rate Limiting**: Built-in protection against abuse
*   **Input Validation**: Comprehensive request validation
*   **Circuit Breaker**: Automatic failure handling
*   **Metrics Collection**: Performance monitoring
*   **OpenAPI 3.0**: Complete API documentation
*   **Swagger UI**: Interactive API explorer

## 🌐 API Endpoints

### System Endpoints

#### Health Check

```http
GET /health
```

Check the health status of the microservice.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "externalApi": "healthy"
  },
  "metrics": {
    "totalRequests": 1000,
    "errorRate": 0.5,
    "averageResponseTime": 150
  }
}
```

#### API Documentation

```http
GET /docs
```

Access the interactive Swagger UI documentation.

#### Metrics

```http
GET /metrics
```

Get API performance metrics and statistics.

### Weather Endpoints

#### Get Current Weather by City ID

```http
GET /weather/current/{cityId}?units=metric&lang=en
```

**Parameters:**

*   `cityId` (path): OpenWeatherMap city ID (e.g., 2643743 for London)
*   `units` (query): Temperature units (`metric`, `imperial`, `kelvin`)
*   `lang` (query): Language for descriptions (`en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `zh`, `ja`, `ko`)

#### Get Current Weather by Coordinates

```http
GET /weather/current/coordinates?lat=51.5074&lon=-0.1278&units=metric&lang=en
```

**Parameters:**

*   `lat` (query): Latitude (-90 to 90)
*   `lon` (query): Longitude (-180 to 180)
*   `units` (query): Temperature units
*   `lang` (query): Language for descriptions

#### Get Current Weather by Location

```http
GET /weather/current/location?q=London,GB&units=metric&lang=en
```

**Parameters:**

*   `q` (query): City name and country code (e.g., "London,GB")
*   `units` (query): Temperature units
*   `lang` (query): Language for descriptions

#### Get Current Weather by Zipcode

```http
GET /weather/current/zipcode?zip=10001&country=US&units=metric&lang=en
```

**Parameters:**

*   `zip` (query): Zipcode
*   `country` (query): Country code (ISO 3166-1 alpha-2)
*   `units` (query): Temperature units
*   `lang` (query): Language for descriptions

### Enhanced Weather Endpoints

#### Get Enhanced Current Weather

```http
GET /weather/current/{cityId}/enhanced?units=metric&lang=en
```

Returns weather data with additional analysis, recommendations, and alerts.

### Forecast Endpoints

#### Get Weather Forecast

```http
GET /forecast/days/{location}/{days}?units=metric&lang=en
```

**Parameters:**

*   `location` (path): City name (use URL encoding for spaces)
*   `days` (path): Number of forecast days (1-5)
*   `units` (query): Temperature units
*   `lang` (query): Language for descriptions

#### Get Enhanced Weather Forecast

```http
GET /forecast-enhanced/days/{location}/{days}?units=metric&lang=en
```

Returns forecast data with additional analysis and insights.

## 🔐 Authentication

The API requires an API key for all requests. Include your API key in one of these ways:

### Header (Recommended)

```http
X-API-Key: your-api-key-here
```

### Query Parameter

```http
?api_key=your-api-key-here
```

## 🚦 Rate Limiting

The API implements rate limiting to ensure fair usage:

*   **Per API Key**: 1,000 requests per hour
*   **Per IP Address**: 100 requests per minute

Rate limit information is included in response headers:

*   `X-RateLimit-Limit`: Maximum requests allowed
*   `X-RateLimit-Remaining`: Requests remaining in current window
*   `X-RateLimit-Reset`: Timestamp when the limit resets

## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "error": "ERROR_TYPE",
  "message": "Human-readable error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "details": {
    "additional": "error details"
  },
  "requestId": "req_123456789"
}
```

### Common Error Types

*   `VALIDATION_ERROR`: Invalid request parameters
*   `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
*   `SERVICE_UNAVAILABLE`: Service temporarily unavailable
*   `AUTHENTICATION_ERROR`: Invalid API key
*   `NOT_FOUND`: Resource not found
*   `INTERNAL_ERROR`: Server error

## 📊 Response Formats

### Weather Response

```json
{
  "location": {
    "name": "London",
    "country": "United Kingdom",
    "countryCode": "GB",
    "coordinates": {
      "latitude": 51.5074,
      "longitude": -0.1278
    },
    "timezone": "Europe/London"
  },
  "current": {
    "temperature": {
      "value": 15.5,
      "unit": "celsius"
    },
    "feelsLike": {
      "value": 14.2,
      "unit": "celsius"
    },
    "humidity": 65,
    "pressure": 1013.25,
    "visibility": 10000,
    "wind": {
      "speed": 3.5,
      "direction": 180,
      "gust": 5.2
    },
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "OpenWeatherMap"
}
```

### Enhanced Weather Response

```json
{
  "location": { /* ... */ },
  "current": { /* ... */ },
  "enhanced": {
    "analysis": {
      "comfortIndex": 7.5,
      "uvIndex": 3.2,
      "airQuality": "good"
    },
    "recommendations": [
      "Perfect weather for outdoor activities",
      "Consider light clothing"
    ],
    "alerts": []
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "OpenWeatherMap"
}
```

## 💡 Examples

### Get Current Weather for London

```bash
curl -X GET "https://api.openweather-microservice.com/v1/weather/current/2643743?units=metric&lang=en" \
  -H "X-API-Key: your-api-key-here"
```

### Get Weather Forecast

```bash
curl -X GET "https://api.openweather-microservice.com/v1/forecast/days?q=London,GB&days=5&units=metric" \
  -H "X-API-Key: your-api-key-here"
```

### Search Cities

```bash
curl -X GET "https://api.openweather-microservice.com/v1/info/cities?q=London&country=GB&limit=5" \
  -H "X-API-Key: your-api-key-here"
```

## 🧪 Testing

The project includes comprehensive testing:

### Run All Tests

```bash
npm test
```

### Run Unit Tests

```bash
npm run test:unit
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run Tests by Category

```bash
npm run test:integration:weather
npm run test:integration:forecast
npm run test:integration:info
```

### Test Coverage

```bash
npm run test:cov
```

## 🚀 Deployment

### Local Development

```bash
npm start
```

### AWS Deployment

```bash
serverless deploy
```

### Environment Variables

*   `API_KEY`: OpenWeatherMap API key
*   `NODE_ENV`: Environment (development, staging, production)

## 📚 Additional Resources

*   [OpenAPI 3.0 Specification](./openapi.yaml)
*   [Swagger UI Documentation](./docs)
*   [Test Coverage Report](./coverage)
*   [API Metrics](./metrics)

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Add tests for new functionality
5.  Ensure all tests pass
6.  Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
