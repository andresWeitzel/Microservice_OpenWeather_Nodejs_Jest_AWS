![Index app](./doc/assets/img/open-weather.jpg)

<div align="right">
  <img width="25" height="25" src="./doc/assets/icons/devops/png/aws.png" />
  <img width="25" height="25" src="./doc/assets/icons/aws/png/lambda.png" />
  <img width="27" height="27" src="./doc/assets/icons/devops/png/postman.png" />
  <img width="29" height="27" src="./doc/assets/icons/devops/png/git.png" />
  <img width="28" height="27" src="./doc/assets/icons/aws/png/api-gateway.png" />
  <img width="27" height="25" src="./doc/assets/icons/aws/png/parameter-store.png" />
  <img width="27" height="27" src="./doc/assets/icons/backend/javascript-typescript/png/nodejs.png" />
</div>

<br>

<br>

<div align="right">
    <a href="./README.md" target="_blank">
      <img src="./doc/assets/translation/arg-flag.jpg" width="10%" height="10%" />
  </a> 
   <a href="./README.md" target="_blank">
      <img src="./doc/assets/translation/eeuu-flag.jpg" width="10%" height="10%" />
  </a>
</div>

<br>

<div align="center">

# Microservice OpenWeather AWS ![(status-completed)](./doc/assets/icons/badges/status-completed.svg)

</div>  

Microservice for the integration of the Open Weather API with focus on unit and integration tests implementing Nodejs, Jest, Serverless-framework, aws-lambda, api gateway, git, others.  AWS services are tested locally. The project code and its documentation (less technical doc) have been developed in English.

*   [Weather-conditions](https://openweathermap.org/weather-conditions)
*   [Api keys](https://home.openweathermap.org/api_keys)
*   [Playlist functionality test](https://www.youtube.com/watch?v=oLSrmqMq0Zs\&list=PLCl11UFjHurB9JzGtm5e8-yp52IcZDs5y) <a href="https://www.youtube.com/watch?v=oLSrmqMq0Zs\&list=PLCl11UFjHurB9JzGtm5e8-yp52IcZDs5y" target="_blank"> <img src="./doc/assets/social-networks/yt.png" width="5%" height="5%" /> </a>

<br>

## Index 📜

<details>
 <summary> See </summary>

 <br>

### Sección 1) Description, configuration and technologies.

*   [1.0) Project description.](#10-description-)
*   [1.1) Project execution.](#12-project-execution-)
    *   [1.1.1) OpenWeather API Configuration](#111-openweather-api-configuration)
*   [1.1.2) Project Configuration File Setup](#112-project-configuration-file-setup)
*   [1.1.3) API Key Security Best Practices](#113-api-key-security-best-practices)
*   [1.1.4) OpenWeather API Endpoints Used](#114-openweather-api-endpoints-used)
*   [1.1.5) Rate Limits and Pricing](#115-rate-limits-and-pricing)
*   [1.1.6) Troubleshooting](#116-troubleshooting)
*   [1.1.7) Additional Resources](#117-additional-resources)
*   [1.1.8) Support](#118-support)
*   [1.2) Technologies.](#12-technologies-)

### Sección 2) Endpoints and Examples

*   [2.1) Weather Endpoints.](#21-weather-endpoints-)
*   [2.2) Endpoints and resources.](#22-endpoints-and-resources-)
*   [2.3) Examples.](#23-examples-)
*   [2.4) Forecast Endpoints.](#24-forecast-endpoints-)
*   [2.5) Forecast Examples.](#25-forecast-examples-)
*   [2.6) Data Persistence and Storage.](#26-data-persistence-and-storage-)
*   [2.7) Quick Examples - All Weather Endpoints.](#27-quick-examples---all-weather-endpoints-)

### Sección 3) Functionality test and references

*   [3.1) Functionality test.](#31-functionality-test-and-references-)
*   [3.2) References.](#32-references-)

<br>

</details>

<br>

## Sección 1) Description, configuration and technologies.

### 1.0) Description [🔝](#index-)

<details>
  <summary>See</summary>

 <br>

### 1.0.0) General description

This microservice provides a comprehensive **REST API for weather information** using the **OpenWeatherMap API**. It's built with **Node.js**, **Jest** for testing, **Serverless Framework**, and **AWS Lambda** for serverless deployment.

#### 🌟 Key Features

*   **🌤️ Complete Weather Data**: Current weather conditions for any location worldwide
*   **📊 Advanced Forecasts**: 5-day weather forecasts with multiple filtering options
*   **🔍 Multiple Search Methods**: Search by city name, coordinates, city ID, or postal code
*   **🌍 Internationalization**: Support for multiple languages and units
*   **⚡ Enhanced Endpoints**: Rich data with recommendations, alerts, and analysis
*   **🛡️ Robust Architecture**: Circuit breaker, rate limiting, and caching
*   **📝 Comprehensive Testing**: Unit and integration tests with Jest
*   **☁️ AWS Ready**: Serverless deployment with Lambda and API Gateway

#### 🎯 Target Use Cases

*   **Weather Applications**: Mobile and web weather apps
*   **IoT Projects**: Smart home and environmental monitoring
*   **Travel Planning**: Tourism and travel applications
*   **Business Intelligence**: Weather-dependent business decisions
*   **Educational Projects**: Learning serverless architecture and API integration

#### 🏗️ Architecture Overview

The microservice follows a **microservices architecture** pattern with:
- **Serverless Functions**: AWS Lambda for scalable, cost-effective execution
- **API Gateway**: RESTful API management and routing
- **Parameter Store**: Secure environment variable management
- **Caching Layer**: In-memory and file-based caching for performance
- **Circuit Breaker**: Fault tolerance and resilience patterns

### 1.0.1) Description Architecture and Operation

#### 🏛️ System Architecture

The microservice implements a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│                  Controller Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Weather   │ │  Forecast   │ │    Info     │           │
│  │ Controllers │ │ Controllers │ │ Controllers │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Middleware Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Circuit   │ │    Rate     │ │   Metrics   │           │
│  │   Breaker   │ │   Limiter   │ │  Collector  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Cache     │ │  Transform  │ │   Validate  │           │
│  │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                   External APIs                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ OpenWeather │ │   AWS SSM   │ │   File      │           │
│  │     API     │ │ Parameters  │ │   System    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

#### 🔄 Request Flow

1. **API Gateway**: Receives HTTP requests and routes to appropriate Lambda function
2. **Controller Layer**: Validates parameters and orchestrates business logic
3. **Middleware**: Applies cross-cutting concerns (rate limiting, circuit breaker, metrics)
4. **Service Layer**: Processes data, applies transformations, and manages caching
5. **External APIs**: Fetches data from OpenWeatherMap API
6. **Response**: Returns formatted data with appropriate HTTP status codes

#### 🛡️ Resilience Patterns

*   **Circuit Breaker**: Prevents cascade failures when external APIs are down
*   **Rate Limiting**: Protects against abuse and respects API quotas
*   **Caching**: Reduces API calls and improves response times
*   **Retry Logic**: Handles temporary failures gracefully
*   **Fallback Responses**: Provides cached data when external services fail

#### 📊 Data Flow

1. **Input Validation**: Parameters are validated against schemas
2. **Cache Check**: System checks for cached data first
3. **API Call**: If not cached, calls OpenWeatherMap API
4. **Data Transformation**: Applies business logic and enhancements
5. **Storage**: Saves data to cache and JSON files
6. **Response**: Returns formatted data to client

#### 🔧 Technical Components

*   **AWS Lambda**: Serverless compute for handling requests
*   **API Gateway**: HTTP API management and routing
*   **Parameter Store**: Secure configuration management
*   **Jest**: Comprehensive testing framework
*   **Serverless Framework**: Infrastructure as Code
*   **Node.js**: Runtime environment for JavaScript execution

</details>


### 1.1) Project execution [🔝](#index-)

<details>
  <summary>Ver</summary>

 <br>

#### 1.1.1) OpenWeather API Configuration

This microservice integrates with the OpenWeather API to retrieve weather information. Follow these detailed steps to configure your API access:

##### Step 1: Account Creation

1.  **Visit OpenWeatherMap**: Go to <https://openweathermap.org/>
2.  **Sign Up**: Click "Sign In" → "Sign Up" in the top right corner
3.  **Complete Registration**:
    *   Enter your email address
    *   Create a strong password
    *   Accept terms and conditions
    *   Click "Create Account"
4.  **Email Verification**: Check your inbox and click the verification link

##### Step 2: API Key Generation

1.  **Login**: Sign in to your OpenWeather account
2.  **Navigate to API Keys**: Go to <https://home.openweathermap.org/api_keys>
3.  **Default Key**: You'll see a default API key automatically generated
4.  **⚠️ CRITICAL - Activation Time**: New API keys take **up to 2 hours to activate**
5.  **Do NOT test immediately** - you'll get 401 "Invalid API key" errors until activation is complete

##### Step 3: Configure the Project

1.  **Open Configuration File**: Open the file `serverless-ssm.yml` in the project root
2.  **Update API Key**: Replace the placeholder value with your actual API key:
    ```yaml
    # Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "YOUR_ACTUAL_API_KEY_HERE"
    ```

##### Step 4: Test Your Configuration

**⚠️ IMPORTANT: Wait for API Key Activation**

**Before testing, ensure your API key has been active for at least 2 hours.** If you just created it, wait before proceeding.

1.  **Start the Application**:
    ```bash
    npm start
    ```

2.  **Test the Endpoint**: Use your preferred HTTP client (Postman, curl, etc.):
    ```bash
    # Test with curl
    curl http://localhost:4000/v1/weather/country/London
    ```

# Test with Postman

GET http://localhost:4000/v1/weather/country/New%20York

````

3. **Expected Response**: A successful response should look like:
```json
{
  "statusCode": 200,
  "body": {
    "coord": {"lon": -0.13, "lat": 51.51},
    "weather": [{"id": 300, "main": "Drizzle", "description": "light intensity drizzle"}],
    "base": "stations",
    "main": {
      "temp": 280.32,
      "pressure": 1012,
      "humidity": 81,
      "temp_min": 279.15,
      "temp_max": 281.15
    },
    "visibility": 10000,
    "wind": {"speed": 4.1, "deg": 80},
    "clouds": {"all": 90},
    "dt": 1485789600,
    "sys": {
      "type": 1,
      "id": 5091,
      "message": 0.0103,
      "country": "GB",
      "sunrise": 1485762037,
      "sunset": 1485794875
    },
    "id": 2643743,
    "name": "London",
    "cod": 200
  }
}
````

#### 1.1.2) Project Configuration File Setup

**⚠️ CRITICAL: Create the Configuration File (if it does not exist)**

Before running the project, you **MUST** create the `serverless-ssm.yml` file in the project root directory. This file contains the environment variables needed for the microservice to function properly.

##### Step 1: Create the Configuration File

1.  **Navigate to Project Root**: Go to the main project directory
2.  **Create New File**: Create a new file named `serverless-ssm.yml`
3.  **Add Configuration**: Copy and paste the following content:

```yaml
# Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "YOUR_ACTUAL_API_KEY_HERE"
```

##### Step 2: Update with Your API Key

Replace `"YOUR_ACTUAL_API_KEY_HERE"` with the API key you obtained from OpenWeather:

```yaml
# Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "858923c0cff4df1c4415f2493500ad37"  # Replace with your actual API key
```

##### Step 3: Verify File Location

Ensure the file is in the correct location:

    Microservice_OpenWeather_Nodejs_Jest_AWS/
    ├── serverless-ssm.yml          # ← This file must exist here
    ├── package.json
    ├── serverless.yml
    ├── src/
    └── ...

##### Step 4: Security Considerations

*   ✅ **Add to .gitignore** - Ensure `serverless-ssm.yml` is in your `.gitignore` file
*   ✅ **Keep private** - Never commit this file to version control
*   ✅ **Backup safely** - Store your API key in a secure location
*   ❌ **Don't share** - Never share your API key publicly
*   ❌ **Don't commit** - Avoid accidentally committing to git

**Example .gitignore entry:**

    # Configuration files with sensitive data
    serverless-ssm.yml
    *.env

#### 1.1.3) API Key Security Best Practices

*   ✅ **Wait for activation** - New keys take up to 2 hours to activate
*   ✅ **Keep your API key private** - Never share it publicly
*   ✅ **Use environment variables** - Don't hardcode in source code
*   ✅ **Monitor usage** - Stay within free tier limits (1,000 calls/day)
*   ✅ **Rotate keys** - Create new keys if compromised
*   ❌ **Don't test immediately** - You'll get 401 errors until activation
*   ❌ **Don't commit to git** - Add config files to .gitignore
*   ❌ **Don't share in logs** - Avoid logging API keys

#### 1.1.4) OpenWeather API Endpoints Used

This microservice uses the **Current Weather Data** endpoint:

*   **Base URL**: `https://api.openweathermap.org/data/2.5/weather`
*   **Method**: GET
*   **Parameters**:
    *   `q`: City name (e.g., "London", "New York")
    *   `appid`: Your API key
*   **Response**: JSON with weather data including temperature, humidity, wind, etc.

#### 1.1.5) Rate Limits and Pricing

| Plan | Calls/Day | Features |
|------|-----------|----------|
| Free | 1,000 | Current weather, 5-day forecast |
| Starter | 100,000 | Extended forecast, historical data |
| Business | 1,000,000 | All features, priority support |

*   **Response Time**: Usually under 200ms
*   **Data Update**: Every 10 minutes

#### 1.1.6) Troubleshooting

##### ⚠️ IMPORTANT: API Key Activation Time

**New API keys require up to 2 hours to activate.** This is the most common cause of 401 errors.

**What happens:**

*   You create a new API key
*   You test it immediately with curl or your application
*   You get 401 "Invalid API key" error
*   You think something is wrong with your setup

**Solution:**

*   **Wait 2 hours** after creating the key
*   Don't panic - this is normal behavior
*   Set a reminder and test again later

##### Common Issues

**1. "401 Unauthorized" Error**

*   **Cause**: Invalid or inactive API key
*   **Solution**:
    *   **⚠️ Most Common**: Wait up to 2 hours for new keys to activate
    *   Verify your API key is correct (no extra spaces)
    *   Check if you've exceeded daily limits
    *   If testing immediately after creation, this is normal - wait 2 hours

**2. "404 Not Found" Error**

*   **Cause**: Invalid city name or country
*   **Solution**:
    *   Use correct city names (e.g., "London" not "Londres")
    *   Check spelling and formatting
    *   Try with country code: "London,UK"

**3. "429 Too Many Requests" Error**

*   **Cause**: Exceeded rate limits
*   **Solution**:
    *   Wait before making more requests
    *   Check your daily usage
    *   Consider upgrading to paid plan

**4. Environment Variables Not Loading**

*   **Cause**: Configuration file issues
*   **Solution**:
    *   Verify `serverless-ssm.yml` exists
    *   Check file format (YAML syntax)
    *   Restart the application

##### Debug Steps

1.  **Check API Key**: Verify it's active in OpenWeather dashboard
2.  **Test Direct API Call**: Use curl to test OpenWeather directly
3.  **Check Logs**: Look for error messages in application logs
4.  **Verify Configuration**: Ensure all environment variables are set

##### Direct API Test

Test your API key directly with OpenWeather:

```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY"
```

#### 1.1.7) Additional Resources

*   [OpenWeather API Documentation](https://openweathermap.org/api)
*   [API Key Management](https://home.openweathermap.org/api_keys)
*   [Weather Conditions Codes](https://openweathermap.org/weather-conditions)
*   [Support Forum](https://openweathermap.org/forum)

#### 1.1.8) Support

If you continue to have issues:

1.  Check the [OpenWeather FAQ](https://openweathermap.org/faq)
2.  Visit the [OpenWeather Forum](https://openweathermap.org/forum)
3.  Contact OpenWeather support for API-specific issues
4.  Check this project's issues for known problems

<br>

</details>

### 1.2) Technologies [🔝](#index-)

<details>
  <summary>See</summary>

 <br>

#### 🏗️ Core Technologies

| **Technology** | **Version** | **Purpose** | **Role in Project** |
| ------------- | ------------- | ------------- | ------------- |
| [Node.js](https://nodejs.org/) | 14.18.1 | JavaScript Runtime | Core runtime environment for serverless functions |
| [Serverless Framework](https://www.serverless.com/) | 3.23.0 | Infrastructure as Code | AWS deployment and configuration management |
| [AWS Lambda](https://aws.amazon.com/lambda/) | Latest | Serverless Compute | Function execution platform |
| [AWS API Gateway](https://aws.amazon.com/api-gateway/) | 2.0 | API Management | HTTP API routing and management |
| [AWS Systems Manager](https://aws.amazon.com/systems-manager/) | 3.0 | Parameter Store | Secure environment variable management |

#### 🧪 Testing & Quality

| **Technology** | **Version** | **Purpose** | **Role in Project** |
| ------------- | ------------- | ------------- | ------------- |
| [Jest](https://jestjs.io/) | 29.7.0 | Testing Framework | Unit and integration testing |
| [Supertest](https://github.com/visionmedia/supertest) | Latest | HTTP Testing | API endpoint testing |
| [ESLint](https://eslint.org/) | Latest | Code Linting | Code quality and style enforcement |
| [Prettier](https://prettier.io/) | Latest | Code Formatting | Consistent code formatting |

#### 🔌 Serverless Plugins

| **Plugin** | **Version** | **Purpose** | **Configuration** |
| ------------- | ------------- | ------------- | ------------- |
| [serverless-offline](https://www.npmjs.com/package/serverless-offline) | Latest | Local Development | Local Lambda simulation |
| [serverless-offline-ssm](https://www.npmjs.com/package/serverless-offline-ssm) | Latest | Parameter Store Simulation | Local SSM parameter simulation |
| [serverless-auto-swagger](https://www.npmjs.com/package/serverless-auto-swagger) | Latest | API Documentation | Automatic OpenAPI documentation |

#### 🛠️ Development Tools

| **Tool** | **Version** | **Purpose** | **Usage** |
| ------------- | ------------- | ------------- | ------------- |
| [Visual Studio Code](https://code.visualstudio.com/) | 1.72.2+ | IDE | Primary development environment |
| [Postman](https://www.postman.com/) | 10.11+ | API Testing | Endpoint testing and documentation |
| [Git](https://git-scm.com/) | 2.29.1+ | Version Control | Source code management |
| [npm](https://www.npmjs.com/) | 6.14+ | Package Manager | Dependency management |

#### 📦 Key Dependencies

| **Package** | **Version** | **Purpose** | **Usage** |
| ------------- | ------------- | ------------- | ------------- |
| [axios](https://axios-http.com/) | Latest | HTTP Client | OpenWeather API requests |
| [lodash](https://lodash.com/) | Latest | Utility Library | Data manipulation and utilities |
| [moment](https://momentjs.com/) | Latest | Date/Time Library | Date formatting and manipulation |
| [joi](https://joi.dev/) | Latest | Validation Library | Input parameter validation |

#### 🏗️ Architecture Components

| **Component** | **Technology** | **Purpose** | **Implementation** |
| ------------- | ------------- | ------------- | ------------- |
| **API Gateway** | AWS API Gateway | HTTP API Management | RESTful endpoint routing |
| **Lambda Functions** | AWS Lambda | Serverless Compute | Individual endpoint handlers |
| **Parameter Store** | AWS SSM | Configuration Management | Secure API keys and settings |
| **Caching** | In-Memory + File | Performance Optimization | Response caching and storage |
| **Circuit Breaker** | Custom Implementation | Fault Tolerance | External API failure protection |
| **Rate Limiting** | Custom Implementation | API Protection | Request throttling and abuse prevention |

#### 🌐 External APIs

| **Service** | **Purpose** | **Integration** | **Data Format** |
| ------------- | ------------- | ------------- | ------------- |
| [OpenWeatherMap API](https://openweathermap.org/api) | Weather Data Source | REST API Integration | JSON |
| [OpenWeatherMap Forecast API](https://openweathermap.org/forecast5) | Weather Forecast Data | REST API Integration | JSON |

#### 🔧 Development Extensions (VSCode)

| **Extension** | **Purpose** | **Benefits** |
| ------------- | ------------- | ------------- |
| **Prettier** | Code Formatting | Consistent code style |
| **ESLint** | Code Linting | Code quality enforcement |
| **YAML** | YAML Support | Serverless configuration files |
| **Error Lens** | Error Highlighting | Inline error display |
| **Tabnine** | AI Code Completion | Intelligent code suggestions |
| **Thunder Client** | API Testing | Built-in HTTP client |
| **GitLens** | Git Integration | Enhanced Git functionality |

#### 📊 Monitoring & Observability

| **Component** | **Purpose** | **Implementation** |
| ------------- | ------------- | ------------- |
| **Metrics Collection** | Performance Monitoring | Custom metrics middleware |
| **Logging** | Debug & Monitoring | Structured logging with timestamps |
| **Health Checks** | Service Status | Dedicated health endpoint |
| **Error Tracking** | Issue Detection | Comprehensive error handling |

#### 🚀 Deployment & DevOps

| **Tool/Service** | **Purpose** | **Configuration** |
| ------------- | ------------- | ------------- |
| **Serverless Framework** | Infrastructure Deployment | `serverless.yml` configuration |
| **AWS CloudFormation** | Resource Provisioning | Automatic via Serverless Framework |
| **GitHub Actions** | CI/CD Pipeline | Automated testing and deployment |
| **AWS CloudWatch** | Monitoring & Logging | Centralized observability |

<br>

#### 🔄 Technology Stack Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   VSCode    │ │   Postman   │ │     Git     │           │
│  │     IDE     │ │   Testing   │ │   Version   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Node.js   │ │   Jest      │ │  Serverless │           │
│  │   Runtime   │ │   Testing   │ │  Framework  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    AWS Cloud Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Lambda   │ │ API Gateway │ │     SSM     │           │
│  │  Functions  │ │  Management │ │ Parameters  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                  External Services                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ OpenWeather │ │   GitHub    │ │ CloudWatch  │           │
│  │     API     │ │    Actions  │ │ Monitoring  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

</details>

<br>

## Sección 2) Endpoints and Examples.

### 2.1) Weather Endpoints [🔝](#index-)

<details>
  <summary>See</summary>

<br>

This section describes all weather endpoints implemented in the microservice, each corresponding to a different variant of the OpenWeatherMap API.


***

## 📊 Endpoint Comparison

| Endpoint | Parameters | Use Case | Example |
|----------|------------|----------|---------|
| `/v1/weather/location/{location}` | City | Search by name | Buenos Aires |
| `/v1/weather-enhanced/location/{location}` | City | Enriched data | Buenos Aires |
| `/v1/weather/coordinates/{lat}/{lon}` | Coordinates | GPS applications | -34.6132, -58.3772 |
| `/v1/weather-enhanced/coordinates/{lat}/{lon}` | Coordinates | Enriched GPS data | -34.6132, -58.3772 |
| `/v1/weather/id/{cityId}` | ID | Fast search | 3435910 |
| `/v1/weather-enhanced/id/{cityId}` | ID | Enriched ID data | 3435910 |
| `/v1/weather/zipcode/{zipcode}/{countryCode}` | Postal + Country | Local search | 10001, us |
| `/v1/weather-enhanced/zipcode/{zipcode}/{countryCode}` | Postal + Country | Enriched postal data | 10001, us |
| `/v1/weather/units/{location}/{units}` | City + Units | User preferences | London, metric |
| `/v1/weather/language/{location}/{language}` | City + Language | Internationalization | Paris, es |
| `/v1/weather/combined/{location}/{units}/{language}` | All (optional) | Complete configuration | Tokyo, metric, es |
| `/v1/weather-enhanced/combined/{location}/{units}/{language}` | All (required) | Complete enriched configuration | Tokyo, metric, es |



## 1. By City Name

**Original Endpoint** (renamed for consistency)

    GET /v1/weather/location/{location}

**Description**: Get weather data by city name
**Parameters**:

*   `location`: City name (e.g., "Buenos Aires", "London")

**Example**:

```bash
curl http://localhost:4000/v1/weather/location/Buenos%20Aires
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}`

**Controller**: `get-by-location.js`

### 1.1. Enhanced Weather by City Name

**Enhanced Endpoint**

    GET /v1/weather-enhanced/location/{location}

**Description**: Get enriched weather data by city name
**Parameters**:

*   `location`: City name (e.g., "Buenos Aires", "London")

**Example**:

```bash
curl http://localhost:4000/v1/weather-enhanced/location/Buenos%20Aires
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}`

**Controller**: `get-by-location-enhanced.js`

**Additional Features**:

*   Temperature conversions (Kelvin, Celsius, Fahrenheit)
*   Personalized recommendations
*   Smart alerts
*   Comfort analysis
*   Sun information

***

## 2. By Coordinates

**New Endpoint**

    GET /v1/weather/coordinates/{lat}/{lon}

**Description**: Get weather data by geographical coordinates
**Parameters**:

*   `lat`: Latitude (-90 to 90)
*   `lon`: Longitude (-180 to 180)

**Example**:

```bash
curl http://localhost:4000/v1/weather/coordinates/-34.6132/-58.3772
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}`

**Controller**: `get-by-coordinates.js`

**Validations**:

*   Latitude must be between -90 and 90
*   Longitude must be between -180 and 180
*   Both parameters must be valid numbers

### 2.1. Enhanced Weather by Coordinates

**Enhanced Endpoint**

    GET /v1/weather-enhanced/coordinates/{lat}/{lon}

**Description**: Get enriched weather data by geographical coordinates
**Parameters**:

*   `lat`: Latitude (-90 to 90)
*   `lon`: Longitude (-180 to 180)

**Example**:

```bash
curl http://localhost:4000/v1/weather-enhanced/coordinates/-34.6132/-58.3772
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}`

**Controller**: `get-by-coordinates-enhanced.js`

**Additional Features**:

*   Temperature conversions (Kelvin, Celsius, Fahrenheit)
*   Personalized recommendations
*   Smart alerts
*   Comfort analysis
*   Sun information

***

## 3. By City ID

**New Endpoint**

    GET /v1/weather/id/{cityId}

**Description**: Get weather data by unique city ID
**Parameters**:

*   `cityId`: Numerical city ID (e.g., 3435910 for Buenos Aires)

**Example**:

```bash
curl http://localhost:4000/v1/weather/id/3435910
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?id={city_id}&appid={API_KEY}`

**Controller**: `get-by-id.js`

**Validations**:

*   ID must be a positive number
*   ID must be a valid integer

### 3.1. Enhanced Weather by City ID

**Enhanced Endpoint**

    GET /v1/weather-enhanced/id/{cityId}

**Description**: Get enriched weather data by unique city ID
**Parameters**:

*   `cityId`: Numerical city ID (e.g., 3435910 for Buenos Aires)

**Example**:

```bash
curl http://localhost:4000/v1/weather-enhanced/id/3435910
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?id={city_id}&appid={API_KEY}`

**Controller**: `get-by-id-enhanced.js`

**Additional Features**:

*   Temperature conversions (Kelvin, Celsius, Fahrenheit)
*   Personalized recommendations
*   Smart alerts
*   Comfort analysis
*   Sun information

***

## 4. By Postal Code

**Endpoint**

    GET /v1/weather/zipcode/{zipcode}/{countryCode}

**Description**: Get weather data by postal code
**Parameters**:

*   `zipcode`: Postal code (e.g., "10001", "SW1A 1AA")
*   `countryCode`: Country code (required, e.g., "us", "gb")

**Example**:

```bash
# With country code
curl http://localhost:4000/v1/weather/zipcode/10001/us
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?zip={zip},{country}&appid={API_KEY}`

**Controller**: `get-by-zipcode.js`

**Validations**:

*   Zipcode must have valid format (2-20 characters, letters, numbers, spaces, hyphens, dots and commas)
*   Country code is required
*   Zipcode must be alphanumeric with allowed special characters

### 4.1. Enhanced Weather by Postal Code

**Enhanced Endpoint**

    GET /v1/weather-enhanced/zipcode/{zipcode}/{countryCode}

**Description**: Get enriched weather data by postal code
**Parameters**:

*   `zipcode`: Postal code (e.g., "10001", "SW1A 1AA")
*   `countryCode`: Country code (required, e.g., "us", "gb")

**Example**:

```bash
curl http://localhost:4000/v1/weather-enhanced/zipcode/10001/us
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?zip={zip},{country}&appid={API_KEY}`

**Controller**: `get-by-zipcode-enhanced.js`

**Additional Features**:

*   Temperature conversions (Kelvin, Celsius, Fahrenheit)
*   Personalized recommendations
*   Smart alerts
*   Comfort analysis
*   Sun information

***

## 5. With Specific Units

**New Endpoint**

    GET /v1/weather/units/{location}/{units}

**Description**: Get weather data with specific units
**Parameters**:

*   `location`: City name
*   `units`: Unit type (`metric`, `imperial`, `kelvin`)

**Examples**:

```bash
# Temperature in Celsius
curl http://localhost:4000/v1/weather/units/London/metric

# Temperature in Fahrenheit
curl http://localhost:4000/v1/weather/units/New%20York/imperial

# Temperature in Kelvin (default)
curl http://localhost:4000/v1/weather/units/Tokyo/kelvin
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={units}&appid={API_KEY}`

**Controller**: `get-with-units.js`

**Available Units**:

*   `metric`: Celsius, m/s, hPa
*   `imperial`: Fahrenheit, mph, hPa
*   `kelvin`: Kelvin, m/s, hPa (default)

***

## 6. With Specific Language

**New Endpoint**

    GET /v1/weather/language/{location}/{language}

**Description**: Get weather data with descriptions in specific language
**Parameters**:

*   `location`: City name
*   `language`: Language code

**Examples**:

```bash
# Spanish
curl http://localhost:4000/v1/weather/language/Paris/es

# French
curl http://localhost:4000/v1/weather/language/London/fr

# German
curl http://localhost:4000/v1/weather/language/Berlin/de
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&lang={lang}&appid={API_KEY}`

**Controller**: `get-with-language.js`

**Available Languages**:

*   `en`: English (default)
*   `es`: Spanish
*   `fr`: French
*   `de`: German
*   `it`: Italian
*   `pt`: Portuguese
*   `ru`: Russian
*   `ja`: Japanese
*   `ko`: Korean
*   `zh_cn`: Simplified Chinese
*   `zh_tw`: Traditional Chinese
*   `ar`: Arabic
*   `hi`: Hindi
*   `th`: Thai
*   `tr`: Turkish
*   `vi`: Vietnamese

***

## 7. With Combined Parameters

**Endpoint**

    GET /v1/weather/combined/{location}/{units}/{language}

**Description**: Get weather data with multiple combined parameters
**Parameters**:

*   `location`: City name (required)
*   `units`: Unit type (optional, default: kelvin)
*   `language`: Language code (optional, default: en)

**Example**:

```bash
# All parameters
curl http://localhost:4000/v1/weather/combined/Tokyo/metric/es
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={units}&lang={lang}&appid={API_KEY}`

**Controller**: `get-by-combined.js`

### 7.1. Enhanced Weather with Combined Parameters

**Enhanced Endpoint**

    GET /v1/weather-enhanced/combined/{location}/{units}/{language}

**Description**: Get enriched weather data with multiple combined parameters
**Parameters**:

*   `location`: City name (required)
*   `units`: Unit type (required)
*   `language`: Language code (required)

**Example**:

```bash
# Enhanced with all parameters (all required)
curl http://localhost:4000/v1/weather-enhanced/combined/Tokyo/metric/es
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={units}&lang={lang}&appid={API_KEY}`

**Controller**: `get-by-combined-enhanced.js`

**Additional Features**:

*   Temperature conversions (Kelvin, Celsius, Fahrenheit)
*   Personalized recommendations
*   Smart alerts
*   Comfort analysis
*   Sun information

**Note**: In the enhanced endpoint, all parameters are required.

***

## 🔧 Common Features

All implemented endpoints include:

### ✅ Parameter Validation

*   Data type validation
*   Allowed ranges for coordinates
*   Valid language codes
*   Valid units

### ✅ Cache System

*   10-minute cache
*   Unique keys per endpoint type
*   Reduced OpenWeatherMap calls

### ✅ Data Storage

*   Automatic JSON file saving
*   Organized structure by endpoint type
*   Persistence for later analysis

### ✅ Error Handling

*   Appropriate HTTP responses
*   Descriptive error messages
*   Detailed logging

### ✅ Logging

*   Generated URL logging
*   Cache usage information
*   Errors and warnings

***

## 🚀 Complete Usage Examples

### Example 1: GPS Application

```bash
# Get weather by GPS coordinates
curl http://localhost:4000/v1/weather/coordinates/40.7128/-74.0060
```

### Example 2: Multilingual Application

```bash
# Weather in Spanish for Spanish-speaking users
curl http://localhost:4000/v1/weather/language/Madrid/es
```

### Example 3: Application with User Preferences

```bash
# Weather in Celsius for European user
curl http://localhost:4000/v1/weather/units/Paris/metric
```

### Example 4: Complete Configuration

```bash
# Complete weather with all preferences
curl http://localhost:4000/v1/weather/combined/Tokyo/metric/es
```

### Example 5: Enhanced Weather with Rich Data

```bash
# Enhanced weather with additional analysis
curl http://localhost:4000/v1/weather-enhanced/combined/Madrid/metric/es
```

***

## 📝 Important Notes

1.  **API Key**: All endpoints require a valid OpenWeatherMap API key
2.  **Rate Limits**: Respect API limits (1000 calls/day on free plan)
3.  **Activation**: New API keys take up to 2 hours to activate
4.  **Cache**: Data is cached for 10 minutes to optimize performance
5.  **Storage**: Data is automatically saved to JSON files

***

## 🔗 References

*   [OpenWeatherMap API Documentation](https://openweathermap.org/api)
*   [Weather API Endpoints](https://openweathermap.org/api/weather-data)
*   [Supported Languages](https://openweathermap.org/current#multi)
*   [Units Format](https://openweathermap.org/current#data)

</details>

### 2.3) Weather Endpoint Examples [🔝](#index-)

<details>
  <summary>See</summary>
<br>

#### Basic Weather Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/weather/location/London
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "coord": {"lon": -0.13, "lat": 51.51},
    "weather": [{"id": 300, "main": "Drizzle", "description": "light intensity drizzle"}],
    "main": {
      "temp": 280.32,
      "pressure": 1012,
      "humidity": 81
    },
    "name": "London",
    "cod": 200
  }
}
```

#### Enhanced Weather Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/weather-enhanced/location/London
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "location": {
      "city": "London",
      "country": "GB",
      "coordinates": {"lon": -0.13, "lat": 51.51},
      "timezone": 0,
      "localTime": "2024-01-15T14:30:00.000Z",
      "isDaytime": true
    },
    "temperature": {
      "kelvin": 280.32,
      "celsius": 7.17,
      "fahrenheit": 44.91,
      "feels_like": {
        "kelvin": 278.15,
        "celsius": 5.0,
        "fahrenheit": 41.0
      }
    },
    "weather": {
      "condition": "Drizzle",
      "description": "light intensity drizzle",
      "icon": "09d",
      "severity": "light",
      "recommendation": "Bring an umbrella or raincoat"
    },
    "atmosphere": {
      "pressure": 1012,
      "humidity": 81,
      "visibility": 10000,
      "clouds": 90
    },
    "wind": {
      "speed": 4.1,
      "direction": 80,
      "description": "Gentle breeze"
    },
    "sun": {
      "sunrise": "07:45 AM",
      "sunset": "04:30 PM",
      "dayLength": "8h 45m"
    },
    "alerts": [
      {
        "type": "temperature",
        "level": "moderate",
        "message": "Cold temperatures expected"
      }
    ],
    "recommendations": {
      "clothing": "Warm jacket or coat",
      "activities": "Indoor activities preferred",
      "transport": "Normal transport conditions",
      "health": "Wear warm clothing"
    },
    "comfort": {
      "index": 6.5,
      "level": "cool"
    }
  }
}
```

#### Search City IDs Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/info/city-ids/London/GB
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "searchQuery": "London",
    "countryCode": "GB",
    "limit": 5,
    "totalResults": 1,
    "source": "local_database",
    "databaseInfo": {
      "version": "1.0.0",
      "totalCities": 150,
      "lastUpdated": "2024-01-15"
    },
    "cities": [
      {
        "id": 2643743,
        "name": "London",
        "state": "England",
        "country": "GB",
        "coordinates": {
          "lat": 51.5074,
          "lon": -0.1276
        },
        "displayName": "London, England, GB"
      }
    ]
  }
}
```

**Database Features:**

*   **📊 150+ Cities**: Major cities from around the world
*   **🌍 Multiple Countries**: Cities with same name in different countries
*   **⚡ Fast Response**: No external API calls needed
*   **🔍 Partial Matching**: Find cities with partial name searches
*   **📅 Always Available**: Works offline, no dependency on external services

#### Enhanced Weather by City ID Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/weather-enhanced/id/2643743
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "location": {
      "city": "London",
      "country": "GB",
      "coordinates": {"lon": -0.1276, "lat": 51.5074},
      "timezone": 0,
      "localTime": "2024-01-15T14:30:00.000Z",
      "isDaytime": true
    },
    "temperature": {
      "kelvin": 280.32,
      "celsius": 7.17,
      "fahrenheit": 44.91,
      "feels_like": {
        "kelvin": 278.15,
        "celsius": 5.0,
        "fahrenheit": 41.0
      }
    },
    "weather": {
      "condition": "Drizzle",
      "description": "light intensity drizzle",
      "icon": "09d",
      "severity": "light",
      "recommendation": "Bring an umbrella or raincoat"
    },
    "atmosphere": {
      "pressure": 1012,
      "humidity": 81,
      "visibility": 10000,
      "clouds": 90
    },
    "wind": {
      "speed": 4.1,
      "direction": 80,
      "description": "Gentle breeze"
    },
    "sun": {
      "sunrise": "07:45 AM",
      "sunset": "04:30 PM",
      "dayLength": "8h 45m"
    },
    "alerts": [
      {
        "type": "temperature",
        "level": "moderate",
        "message": "Cold temperatures expected"
      }
    ],
    "recommendations": {
      "clothing": "Warm jacket or coat",
      "activities": "Indoor activities preferred",
      "transport": "Normal transport conditions",
      "health": "Wear warm clothing"
    },
    "comfort": {
      "index": 6.5,
      "level": "cool"
    }
  }
}
```

#### Enhanced Weather by Coordinates Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/weather-enhanced/coordinates/51.5074/-0.1276
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "location": {
      "city": "London",
      "country": "GB",
      "coordinates": {"lon": -0.1276, "lat": 51.5074},
      "timezone": 0,
      "localTime": "2024-01-15T14:30:00.000Z",
      "isDaytime": true
    },
    "temperature": {
      "kelvin": 280.32,
      "celsius": 7.17,
      "fahrenheit": 44.91,
      "feels_like": {
        "kelvin": 278.15,
        "celsius": 5.0,
        "fahrenheit": 41.0
      }
    },
    "weather": {
      "condition": "Drizzle",
      "description": "light intensity drizzle",
      "icon": "09d",
      "severity": "light",
      "recommendation": "Bring an umbrella or raincoat"
    },
    "atmosphere": {
      "pressure": 1012,
      "humidity": 81,
      "visibility": 10000,
      "clouds": 90
    },
    "wind": {
      "speed": 4.1,
      "direction": 80,
      "description": "Gentle breeze"
    },
    "sun": {
      "sunrise": "07:45 AM",
      "sunset": "04:30 PM",
      "dayLength": "8h 45m"
    },
    "alerts": [
      {
        "type": "temperature",
        "level": "moderate",
        "message": "Cold temperatures expected"
      }
    ],
    "recommendations": {
      "clothing": "Warm jacket or coat",
      "activities": "Indoor activities preferred",
      "transport": "Normal transport conditions",
      "health": "Wear warm clothing"
    },
    "comfort": {
      "index": 6.5,
      "level": "cool"
    }
  }
}
```

#### Testing with curl

```bash
# Test basic endpoint
curl http://localhost:4000/v1/weather/location/New%20York

# Test enhanced endpoint
curl http://localhost:4000/v1/weather-enhanced/location/Paris

# Test with different cities
curl http://localhost:4000/v1/weather-enhanced/location/Tokyo
curl http://localhost:4000/v1/weather-enhanced/location/Sydney

# Test with countries (will return data for capital or major city)
curl http://localhost:4000/v1/weather-enhanced/location/Japan
curl http://localhost:4000/v1/weather-enhanced/location/Australia

# Test coordinates endpoints
curl http://localhost:4000/v1/weather/coordinates/51.5074/-0.1276
curl http://localhost:4000/v1/weather-enhanced/coordinates/40.7128/-74.0060

# Test city ID endpoints
curl http://localhost:4000/v1/weather/id/3435910
curl http://localhost:4000/v1/weather-enhanced/id/2643743

# Test city IDs search endpoints
curl http://localhost:4000/v1/info/city-ids/London
curl http://localhost:4000/v1/info/city-ids/Paris/FR
curl http://localhost:4000/v1/info/city-ids/New%20York/US/3


# NEW: Test different forecast endpoints (not following weather patterns)
# Test forecast by time intervals
curl http://localhost:4000/v1/forecast/interval/London/6h
curl http://localhost:4000/v1/forecast-enhanced/interval/London/12h

# Test forecast by specific days
curl http://localhost:4000/v1/forecast/days/Paris/3
curl http://localhost:4000/v1/forecast-enhanced/days/Paris/5

# Test forecast by time periods
curl http://localhost:4000/v1/forecast/hourly/Tokyo/morning
curl http://localhost:4000/v1/forecast-enhanced/hourly/Tokyo/afternoon
```

#### Testing with Postman

1.  **Basic Weather:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather/location/London`

2.  **Enhanced Weather:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather-enhanced/location/London`

3.  **Basic Weather by Coordinates:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather/coordinates/51.5074/-0.1276`

4.  **Enhanced Weather by Coordinates:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather-enhanced/coordinates/40.7128/-74.0060`

5.  **Basic Weather by City ID:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather/id/3435910`

6.  **Enhanced Weather by City ID:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather-enhanced/id/2643743`

7.  **Search City IDs:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/info/city-ids/London`

8.  **Search City IDs with Country:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/info/city-ids/Paris/FR`

9.  **Search City IDs with Limit:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/info/city-ids/New%20York/US/3`

</details>


### 2.4) Forecast Endpoints [🔝](#index-)

<details>
  <summary>See</summary>

<br>

This section describes all forecast endpoints implemented in the microservice, including valid values, validations, usage examples, and unique characteristics for meteorological forecasts.

***

## 📊 Endpoint Comparison

| Endpoint | Parameters | Use Case | Example |
|----------|------------|----------|---------|
| `/v1/forecast/interval/{location}/{interval}` | City + Interval | Forecast by specific intervals | London, 6h |
| `/v1/forecast-enhanced/interval/{location}/{interval}` | City + Interval | Enhanced forecast by intervals | London, 12h |
| `/v1/forecast/days/{location}/{days}` | City + Days | Forecast for specific days | Paris, 3 |
| `/v1/forecast-enhanced/days/{location}/{days}` | City + Days | Enhanced forecast by days | Paris, 5 |
| `/v1/forecast/hourly/{location}/{hour}` | City + Period | Forecast by day periods | Tokyo, morning |
| `/v1/forecast-enhanced/hourly/{location}/{hour}` | City + Period | Enhanced forecast by periods | Tokyo, afternoon |
| `/v1/forecast/events/{location}/{eventType}` | City + Event | Forecast by event types | Madrid, weekend |
| `/v1/forecast-enhanced/events/{location}/{eventType}` | City + Event | Enhanced forecast by events | Madrid, vacation |
| `/v1/forecast/compare/{location}/{period1}/{period2}` | City + Periods | Comparison between periods | London, today/tomorrow |
| `/v1/forecast-enhanced/compare/{location}/{period1}/{period2}` | City + Periods | Enhanced comparison between periods | London, afternoon/night |
| `/v1/forecast/weekly/{location}/{weeks}` | City + Weeks | Forecast grouped by weeks | Paris, 2 |
| `/v1/forecast-enhanced/weekly/{location}/{weeks}` | City + Weeks | Enhanced forecast by weeks | Madrid, 1 |


## 1. By Time Intervals

**Basic Endpoint**

    GET /v1/forecast/interval/{location}/{interval}

**Description**: Get forecast data filtered by specific time intervals
**Parameters**:

*   `location`: City name (e.g., "London", "Buenos Aires")
*   `interval`: Time interval (`3h`, `6h`, `12h`, `24h`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast/interval/London/6h
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-interval.js`

**Unique Features**:

*   Filters forecast data by specific intervals
*   Reduces the amount of data returned according to the requested interval
*   Provides trend analysis by interval

### 1.1. Enhanced by Time Intervals

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/interval/{location}/{interval}

**Description**: Get enriched forecast data by specific time intervals
**Parameters**:

*   `location`: City name (e.g., "London", "Buenos Aires")
*   `interval`: Time interval (`3h`, `6h`, `12h`, `24h`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/interval/London/12h
```

**Controller**: `get-by-interval-enhanced.js`

**Additional Features**:

*   Trend analysis by interval
*   Specific recommendations per period
*   Statistical summary of the interval
*   Temperature and unit conversions

***

## 2. By Specific Days

**Basic Endpoint**

    GET /v1/forecast/days/{location}/{days}

**Description**: Get forecast data for a specific number of days
**Parameters**:

*   `location`: City name (e.g., "Paris", "Tokyo")
*   `days`: Number of days (1-5)

**Example**:

```bash
curl http://localhost:4000/v1/forecast/days/Paris/3
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-days.js`

**Unique Features**:

*   Filters forecast by specific number of days
*   Generates daily summary with averages
*   Identifies predominant conditions per day
*   Calculates daily temperature ranges

### 2.1. Enhanced by Specific Days

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/days/{location}/{days}

**Description**: Get enriched forecast data for specific days
**Parameters**:

*   `location`: City name (e.g., "Paris", "Tokyo")
*   `days`: Number of days (1-5)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/days/Paris/5
```

**Controller**: `get-by-days-enhanced.js`

**Additional Features**:

*   Day-to-day variation analysis
*   Recommendations for extended periods
*   Long-term temperature trends
*   Activity planning per day

***

## 3. By Time Periods

**Basic Endpoint**

    GET /v1/forecast/hourly/{location}/{hour}

**Description**: Get forecast data filtered by specific time periods
**Parameters**:

*   `location`: City name (e.g., "Tokyo", "New York")
*   `hour`: Time period (`morning`, `afternoon`, `evening`, `night`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast/hourly/Tokyo/morning
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-hourly.js`

**Unique Features**:

*   Filters forecast by day periods
*   Morning: 06:00-11:59
*   Afternoon: 12:00-17:59
*   Evening: 18:00-21:59
*   Night: 22:00-05:59
*   Specific recommendations per period

### 3.1. Enhanced by Time Periods

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/hourly/{location}/{hour}

**Description**: Get enriched forecast data by time periods
**Parameters**:

*   `location`: City name (e.g., "Tokyo", "New York")
*   `hour`: Time period (`morning`, `afternoon`, `evening`, `night`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/hourly/Tokyo/afternoon
```

**Controller**: `get-by-hourly-enhanced.js`

**Additional Features**:

*   Specific analysis by day period
*   Personalized recommendations per hour
*   Wind and humidity analysis by period
*   Activity suggestions by time of day

***

## 4. By Events

**Basic Endpoint**

    GET /v1/forecast/events/{location}/{eventType}

**Description**: Get forecast data filtered by specific event types
**Parameters**:

*   `location`: City name (e.g., "Madrid", "Buenos Aires")
*   `eventType`: Event type (`weekend`, `holiday`, `workday`, `vacation`, `party`, `sports`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast/events/Madrid/weekend
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-events.js`

**Unique Features**:

*   Filters forecast according to specific event types
*   Weekend: Saturdays and Sundays
*   Holiday: holidays
*   Workday: work days
*   Vacation: vacation periods
*   Party: social events
*   Sports: sporting events

### 4.1. Enhanced by Events

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/events/{location}/{eventType}

**Description**: Get enriched forecast data by event types
**Parameters**:

*   `location`: City name (e.g., "Madrid", "Buenos Aires")
*   `eventType`: Event type (`weekend`, `holiday`, `workday`, `vacation`, `party`, `sports`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/events/Madrid/vacation
```

**Controller**: `get-by-events-enhanced.js`

**Additional Features**:

*   Specific analysis by event type
*   Personalized recommendations according to the event
*   Activity planning by event type
*   Clothing and equipment suggestions

***

## 5. Period Comparison

**Basic Endpoint**

    GET /v1/forecast/compare/{location}/{period1}/{period2}

**Description**: Compare forecast data between two specific periods
**Parameters**:

*   `location`: City name (e.g., "London", "Buenos Aires")
*   `period1`, `period2`: Periods to compare (`today`, `tomorrow`, `weekend`, `next_week`, `morning`, `afternoon`, `evening`, `night`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast/compare/London/today/tomorrow
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-compare.js`

**Unique Features**:

*   Compares forecasts between specific periods
*   Temperature difference analysis
*   Meteorological condition comparison
*   Trend identification between periods

### 5.1. Enhanced Period Comparison

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/compare/{location}/{period1}/{period2}

**Description**: Compare enriched forecast data between specific periods
**Parameters**:

*   `location`: City name (e.g., "London", "Buenos Aires")
*   `period1`, `period2`: Periods to compare (`today`, `tomorrow`, `weekend`, `next_week`, `morning`, `afternoon`, `evening`, `night`)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/compare/London/afternoon/night
```

**Controller**: `get-by-compare-enhanced.js`

**Additional Features**:

*   Detailed analysis of differences between periods
*   Recommendations based on comparisons
*   Change trends between periods
*   Strategic planning based on comparisons

***

## 6. By Weeks

**Basic Endpoint**

    GET /v1/forecast/weekly/{location}/{weeks}

**Description**: Get forecast data grouped by weeks
**Parameters**:

*   `location`: City name (e.g., "Paris", "Madrid")
*   `weeks`: Number of weeks (1-4) - Note: the base API provides up to 5 days; the endpoint groups by weekly windows over that data

**Example**:

```bash
curl http://localhost:4000/v1/forecast/weekly/Paris/2
```

**OpenWeatherMap URL**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controller**: `get-by-weekly.js`

**Unique Features**:

*   Groups forecasts by weekly windows
*   Weekly trend analysis
*   Weekly condition summary
*   Medium-term planning

### 6.1. Enhanced by Weeks

**Enhanced Endpoint**

    GET /v1/forecast-enhanced/weekly/{location}/{weeks}

**Description**: Get enriched forecast data grouped by weeks
**Parameters**:

*   `location`: City name (e.g., "Paris", "Madrid")
*   `weeks`: Number of weeks (1-4)

**Example**:

```bash
curl http://localhost:4000/v1/forecast-enhanced/weekly/Madrid/1
```

**Controller**: `get-by-weekly-enhanced.js`

**Additional Features**:

*   Advanced weekly trend analysis
*   Weekly planning recommendations
*   Inter-week comparison
*   Medium-term planning strategies


***

## 🔧 Common Features

All forecast endpoints include:

### ✅ Parameter Validation

*   City name validation
*   Valid interval validation (`3h`, `6h`, `12h`, `24h`)
*   Days validation (1-5)
*   Time period validation (`morning`, `afternoon`, `evening`, `night`)
*   Event type validation (`weekend`, `holiday`, `workday`, `vacation`, `party`, `sports`)
*   Comparison period validation
*   Weeks validation (1-4)

### 💾 Smart Caching

*   10-minute cache to reduce API calls
*   Specific cache keys per endpoint type
*   Automatic cache invalidation

### 📁 Data Persistence

*   Automatic JSON file saving
*   Organized structure by endpoint type
*   Backup data for analysis

### 🔄 Asynchronous Processing

*   Immediate response to user
*   Background data saving
*   Robust error handling

***

## 🎯 Specific Use Cases

### Time Intervals

*   **Planning applications**: For events that require forecasts every 6 or 12 hours
*   **Industrial monitoring**: For processes that need data every 3 hours
*   **Agriculture**: For irrigation and crop care every 24 hours

### Specific Days

*   **Travel planning**: To know the weather for the next 3 days
*   **Sporting events**: To prepare outdoor activities
*   **Construction**: To plan work according to expected weather

### Time Periods

*   **Commuters**: To know the morning weather before leaving
*   **Recreational activities**: To plan activities according to the time of day
*   **Commerce**: To adjust inventories according to expected weather

### Events

*   **Event planning**: To know the weather during weekends or vacations
*   **Sports**: To plan sporting activities according to conditions
*   **Tourism**: To optimize tourist activities

### Comparisons

*   **Decision making**: To compare conditions between periods
*   **Strategic planning**: To choose the best time for activities
*   **Trend analysis**: To identify weather patterns

### Weeks

*   **Medium-term planning**: For activities that require several days
*   **Project management**: To plan work according to weekly weather
*   **Trend analysis**: To identify weekly weather patterns

***

## 🚀 Response Examples

### 6-hour interval

```json
{
  "forecast": {
    "interval": "6h",
    "filteredData": [...],
    "totalEntries": 8,
    "originalEntries": 40,
    "intervalAnalysis": {
      "summary": "6h forecast analysis for 8 periods",
      "averageTemperature": "15.2",
      "trends": [...],
      "recommendations": [...]
    }
  }
}
```

### 3 specific days

```json
{
  "forecast": {
    "days": 3,
    "dailySummary": [
      {
        "day": 1,
        "date": "2024-01-15",
        "averageTemperature": "12.5",
        "predominantCondition": "Clouds"
      }
    ]
  }
}
```

### Morning period

```json
{
  "forecast": {
    "hour": "morning",
    "hourlySummary": {
      "summary": "morning forecast summary",
      "averageTemperature": "8.3",
      "timeRange": {"start": "06:00", "end": "11:59"}
    }
  }
}
```

### Period comparison

```json
{
  "forecast": {
    "comparison": {
      "period1": "today",
      "period2": "tomorrow",
      "temperatureDifference": "+2.3",
      "conditionComparison": "Similar conditions expected",
      "recommendations": [...]
    }
  }
}
```
***

## 📝 Important Notes

1.  **API Key**: All endpoints require a valid OpenWeatherMap API key
2.  **Rate Limits**: Respect API limits (1000 calls/day on free plan)
3.  **Activation**: New API keys take up to 2 hours to activate
4.  **Cache**: Data is cached for 10 minutes to optimize performance
5.  **Storage**: Data is automatically saved to JSON files
6.  **URL-encoding**: Encode spaces/accents, for example `La%20Plata`
7.  **Errors**: If there's no data for the requested range/period, returns 400 with details
8.  **Enhanced**: Adds summaries, trends, recommendations and metadata
9.  **Source**: OpenWeather `data/2.5/forecast` (5 days, 3h intervals)
10. **Units**: Default Kelvin; several endpoints use `metric`

***

## 🔗 References

*   [OpenWeatherMap API Documentation](https://openweathermap.org/api)
*   [5-day/3-hour Forecast API](https://openweathermap.org/forecast5)
*   [Weather API Endpoints](https://openweathermap.org/api/weather-data)
*   [Forecast Data Format](https://openweathermap.org/forecast5#data)

</details>



### 2.5) Forecast Examples [🔝](#index-)

<details>
  <summary>See</summary>
<br>

#### Basic Forecast by Time Intervals

**Request:**

```bash
GET http://localhost:4000/v1/forecast/interval/London/6h
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "interval": "6h",
      "location": "London",
      "filteredData": [
        {
          "dt": 1705320000,
          "main": {
            "temp": 275.15,
            "feels_like": 272.84,
            "pressure": 1013,
            "humidity": 85
          },
          "weather": [
            {
              "id": 500,
              "main": "Rain",
              "description": "light rain"
            }
          ],
          "dt_txt": "2024-01-15 12:00:00"
        }
      ],
      "totalEntries": 8,
      "originalEntries": 40,
      "intervalAnalysis": {
        "summary": "6h forecast analysis for 8 periods",
        "averageTemperature": "15.2",
        "trends": ["increasing", "stable"],
        "recommendations": ["Bring an umbrella", "Wear warm clothing"]
      }
    }
  }
}
```

#### Enhanced Forecast by Time Intervals

**Request:**

```bash
GET http://localhost:4000/v1/forecast-enhanced/interval/London/12h
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "interval": "12h",
      "location": "London",
      "filteredData": [...],
      "totalEntries": 4,
      "originalEntries": 40,
      "intervalAnalysis": {
        "summary": "12h forecast analysis for 4 periods",
        "averageTemperature": "12.8",
        "temperatureRange": {"min": 8.5, "max": 17.2},
        "trends": ["gradual warming", "stable conditions"],
        "recommendations": ["Perfect for outdoor activities", "Light jacket recommended"],
        "statistics": {
          "temperatureVariance": 8.7,
          "humidityAverage": 78,
          "pressureTrend": "stable"
        }
      },
      "enhancedFeatures": {
        "temperatureConversions": {
          "kelvin": 285.95,
          "celsius": 12.8,
          "fahrenheit": 55.04
        },
        "comfortAnalysis": {
          "index": 7.2,
          "level": "comfortable"
        },
        "activityRecommendations": {
          "morning": "Great for jogging",
          "afternoon": "Perfect for picnics",
          "evening": "Ideal for outdoor dining"
        }
      }
    }
  }
}
```

#### Forecast by Specific Days

**Request:**

```bash
GET http://localhost:4000/v1/forecast/days/Paris/3
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "days": 3,
      "location": "Paris",
      "dailySummary": [
        {
          "day": 1,
          "date": "2024-01-15",
          "averageTemperature": "12.5",
          "temperatureRange": {"min": 8.2, "max": 16.8},
          "predominantCondition": "Clouds",
          "humidity": 75,
          "windSpeed": 3.2,
          "recommendation": "Light jacket recommended"
        },
        {
          "day": 2,
          "date": "2024-01-16",
          "averageTemperature": "14.1",
          "temperatureRange": {"min": 10.5, "max": 18.3},
          "predominantCondition": "Clear",
          "humidity": 68,
          "windSpeed": 2.8,
          "recommendation": "Perfect weather for outdoor activities"
        },
        {
          "day": 3,
          "date": "2024-01-17",
          "averageTemperature": "11.8",
          "temperatureRange": {"min": 7.9, "max": 15.6},
          "predominantCondition": "Rain",
          "humidity": 82,
          "windSpeed": 4.1,
          "recommendation": "Bring an umbrella and raincoat"
        }
      ],
      "overallTrend": "Slightly cooling trend with increasing humidity"
    }
  }
}
```

#### Forecast by Time Periods (Morning)

**Request:**

```bash
GET http://localhost:4000/v1/forecast/hourly/Tokyo/morning
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "hour": "morning",
      "location": "Tokyo",
      "hourlySummary": {
        "summary": "morning forecast summary",
        "averageTemperature": "8.3",
        "temperatureRange": {"min": 6.1, "max": 11.2},
        "timeRange": {"start": "06:00", "end": "11:59"},
        "predominantCondition": "Clear",
        "humidity": 65,
        "windSpeed": 2.5,
        "visibility": 10000,
        "recommendations": ["Perfect for morning jogging", "Light layers recommended"]
      },
      "morningActivities": {
        "outdoor": "Excellent conditions",
        "commute": "Clear visibility, comfortable temperature",
        "exercise": "Ideal for outdoor workouts"
      }
    }
  }
}
```

#### Forecast by Events (Weekend)

**Request:**

```bash
GET http://localhost:4000/v1/forecast/events/Madrid/weekend
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "eventType": "weekend",
      "location": "Madrid",
      "eventSummary": {
        "summary": "Weekend forecast for Madrid",
        "dateRange": "2024-01-13 to 2024-01-14",
        "averageTemperature": "16.5",
        "temperatureRange": {"min": 12.3, "max": 20.8},
        "predominantCondition": "Partly Cloudy",
        "humidity": 58,
        "windSpeed": 3.7,
        "recommendation": "Great weekend weather for outdoor activities"
      },
      "weekendActivities": {
        "saturday": {
          "morning": "Perfect for brunch outdoors",
          "afternoon": "Ideal for park visits",
          "evening": "Great for outdoor dining"
        },
        "sunday": {
          "morning": "Excellent for family walks",
          "afternoon": "Perfect for outdoor sports",
          "evening": "Comfortable for evening strolls"
        }
      },
      "eventRecommendations": [
        "Visit Retiro Park",
        "Outdoor dining in Plaza Mayor",
        "Walking tour of historic center",
        "Picnic in Casa de Campo"
      ]
    }
  }
}
```

#### Forecast Period Comparison

**Request:**

```bash
GET http://localhost:4000/v1/forecast/compare/London/today/tomorrow
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "comparison": {
        "period1": "today",
        "period2": "tomorrow",
        "location": "London",
        "temperatureDifference": "+2.3",
        "humidityDifference": "-8",
        "windDifference": "+1.2",
        "conditionComparison": "Similar conditions expected",
        "detailedComparison": {
          "today": {
            "averageTemp": 8.5,
            "humidity": 78,
            "windSpeed": 3.2,
            "condition": "Cloudy",
            "precipitation": "20%"
          },
          "tomorrow": {
            "averageTemp": 10.8,
            "humidity": 70,
            "windSpeed": 4.4,
            "condition": "Partly Cloudy",
            "precipitation": "15%"
          }
        },
        "recommendations": [
          "Tomorrow will be slightly warmer",
          "Lower humidity makes it more comfortable",
          "Slightly windier conditions expected",
          "Better visibility tomorrow"
        ],
        "trendAnalysis": "Improving conditions with warming trend"
      }
    }
  }
}
```

#### Forecast by Weeks

**Request:**

```bash
GET http://localhost:4000/v1/forecast/weekly/Paris/2
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "forecast": {
      "weeks": 2,
      "location": "Paris",
      "weeklySummary": [
        {
          "week": 1,
          "dateRange": "2024-01-15 to 2024-01-19",
          "averageTemperature": "13.2",
          "temperatureRange": {"min": 9.1, "max": 17.8},
          "predominantCondition": "Partly Cloudy",
          "precipitationChance": "25%",
          "humidity": 72,
          "windSpeed": 3.8,
          "recommendation": "Good week for outdoor activities"
        },
        {
          "week": 2,
          "dateRange": "2024-01-22 to 2024-01-26",
          "averageTemperature": "11.8",
          "temperatureRange": {"min": 7.5, "max": 16.2},
          "predominantCondition": "Rain",
          "precipitationChance": "45%",
          "humidity": 78,
          "windSpeed": 4.2,
          "recommendation": "Prepare for wetter conditions"
        }
      ],
      "interWeekComparison": {
        "temperatureTrend": "Cooling trend",
        "humidityTrend": "Increasing",
        "precipitationTrend": "Higher chance of rain",
        "overallAssessment": "Weather becoming more unsettled"
      },
      "weeklyPlanning": {
        "week1": "Ideal for outdoor activities and sightseeing",
        "week2": "Plan indoor activities and bring rain gear"
      }
    }
  }
}
```

#### Testing with curl

```bash
# Test basic forecast endpoints
curl http://localhost:4000/v1/forecast/interval/London/6h
curl http://localhost:4000/v1/forecast/days/Paris/3
curl http://localhost:4000/v1/forecast/hourly/Tokyo/morning

# Test enhanced forecast endpoints
curl http://localhost:4000/v1/forecast-enhanced/interval/London/12h
curl http://localhost:4000/v1/forecast-enhanced/days/Paris/5
curl http://localhost:4000/v1/forecast-enhanced/hourly/Tokyo/afternoon

# Test forecast by events
curl http://localhost:4000/v1/forecast/events/Madrid/weekend
curl http://localhost:4000/v1/forecast-enhanced/events/New%20York/vacation

# Test forecast comparisons
curl http://localhost:4000/v1/forecast/compare/London/today/tomorrow
curl http://localhost:4000/v1/forecast-enhanced/compare/Berlin/morning/evening

# Test forecast by weeks
curl http://localhost:4000/v1/forecast/weekly/Paris/2
curl http://localhost:4000/v1/forecast-enhanced/weekly/Madrid/1
```

#### Testing with Postman

1.  **Basic Forecast by Intervals:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/interval/London/6h`

2.  **Enhanced Forecast by Intervals:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/interval/London/12h`

3.  **Basic Forecast by Days:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/days/Paris/3`

4.  **Enhanced Forecast by Days:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/days/Paris/5`

5.  **Basic Forecast by Time Periods:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/hourly/Tokyo/morning`

6.  **Enhanced Forecast by Time Periods:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/hourly/Tokyo/afternoon`

7.  **Basic Forecast by Events:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/events/Madrid/weekend`

8.  **Enhanced Forecast by Events:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/events/New%20York/vacation`

9.  **Basic Forecast Comparison:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/compare/London/today/tomorrow`

10. **Enhanced Forecast Comparison:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/compare/Berlin/morning/evening`

11. **Basic Forecast by Weeks:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast/weekly/Paris/2`

12. **Enhanced Forecast by Weeks:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/forecast-enhanced/weekly/Madrid/1`

</details>

<br>

## Section 2.6) Data Persistence and Storage [🔝](#index-)

<details>
  <summary>See</summary>

<br>

### 📁 Data Storage Structure

The microservice automatically saves API responses to JSON files for backup, debugging, and reference purposes. This feature ensures data persistence and provides a local cache of recent API calls.

#### Storage Locations

    src/data/json/
    ├── weather/
    │   ├── weather-data.json              # Basic weather data
    │   └── weather-enhanced-data.json     # Enhanced weather data
    ├── forecast/
    │   ├── forecast-interval-data.json           # Forecast by intervals data
    │   ├── forecast-interval-enhanced-data.json  # Enhanced forecast by intervals data
    │   ├── forecast-days-data.json               # Forecast by days data
    │   ├── forecast-days-enhanced-data.json      # Enhanced forecast by days data
    │   ├── forecast-hourly-data.json             # Forecast by hourly periods data

│   ├── forecast-hourly-enhanced-data.json    # Enhanced forecast by hourly periods data
│   ├── forecast-weekly-data.json             # Forecast by weeks data
│   ├── forecast-weekly-enhanced-data.json    # Enhanced forecast by weeks data
│   ├── forecast-events-data.json             # Forecast by events data
│   ├── forecast-events-enhanced-data.json    # Enhanced forecast by events data
│   ├── forecast-compare-data.json            # Forecast comparison data
│   └── forecast-compare-enhanced-data.json   # Enhanced forecast comparison data
└── weather-condition/
└── (weather condition data)

#### How It Works

1.  **API Call**: When an endpoint is called, the microservice fetches data from OpenWeather API
2.  **Data Processing**: The response is processed and transformed (if enhanced endpoint)
3.  **Async JSON Storage**: The processed data is automatically saved to the corresponding JSON file **asynchronously** (non-blocking)
4.  **Immediate Response**: The data is returned to the client immediately, without waiting for file write completion

#### Benefits

*   **🔍 Debugging**: Easy access to recent API responses for troubleshooting
*   **📊 Data Analysis**: Historical data for analysis and development
*   **🛡️ Backup**: Local backup of API responses in case of external API issues
*   **⚡ Development**: Faster development and testing with local data access
*   **🚀 Performance**: Reduces API calls through intelligent caching system

#### File Management

*   **Automatic Updates**: Files are updated with each successful API call
*   **Overwrite Policy**: Each new request overwrites the previous data
*   **Non-Blocking Writes**: JSON files are written asynchronously to avoid blocking API responses
*   **Error Handling**: If file creation fails, the API still returns data to the client (with warning logs)
*   **Storage Location**: Files are stored in the `src/data/json/` directory structure
*   **Enhanced Endpoints**: All enhanced endpoints now save their transformed data to separate JSON files

#### Caching System

The microservice implements a **dual-layer caching strategy**:

1.  **Memory Cache**: Fast in-memory cache for frequently accessed data
    *   **Duration**: 10 minutes for weather data
    *   **Storage**: RAM-based for ultra-fast access
    *   **Eviction**: Automatic cleanup of expired entries

2.  **JSON File Storage**: Persistent storage for backup and debugging
    *   **Duration**: Permanent until overwritten
    *   **Storage**: File system for data persistence
    *   **Purpose**: Backup, debugging, and development reference

**Cache Flow:**

    API Request → Check Memory Cache → If not found → Call OpenWeather API → Store in Memory Cache → Save to JSON File (async) → Return Response Immediately

#### Example File Structure

```json
// src/data/json/weather/weather-data.json
{
    "coord": {"lon": -58.3772, "lat": -34.6132},
    "weather": [{"id": 804, "main": "Clouds", "description": "overcast clouds"}],
    "main": {
        "temp": 290.25,
        "feels_like": 290.24,
        "pressure": 1012,
        "humidity": 85
    },
    "name": "Buenos Aires",
    "cod": 200
}
```

> **💡 Note**: The JSON files serve as a local cache and backup system. They are automatically managed by the microservice and should not be manually edited.

> **⚡ Performance Note**: JSON file writes are performed asynchronously to ensure fast API response times. The microservice returns data immediately without waiting for file operations to complete.

</details>

<br>

## Section 2.7) Quick Examples - All Weather Endpoints [🔝](#index-)

<details>
  <summary>See</summary>

<br>

### 🚀 Quick Test Examples

Test all weather endpoints with these curl commands:

```bash
# 1. Basic weather by city name
curl http://localhost:4000/v1/weather/location/London

# 2. Weather by GPS coordinates
curl http://localhost:4000/v1/weather/coordinates/51.5074/-0.1276

# 2.1. Enhanced weather by GPS coordinates
curl http://localhost:4000/v1/weather-enhanced/coordinates/40.7128/-74.0060

# 3. Weather by city ID (Buenos Aires = 3435910)
curl http://localhost:4000/v1/weather/id/3435910

# 3.1. Enhanced weather by city ID (London = 2643743)
curl http://localhost:4000/v1/weather-enhanced/id/2643743

# 4. Search city IDs
curl http://localhost:4000/v1/info/city-ids/London
curl http://localhost:4000/v1/info/city-ids/Paris/FR
curl http://localhost:4000/v1/info/city-ids/New%20York/US/3

# 5. Weather by zipcode with country
curl http://localhost:4000/v1/weather/zipcode/10001/us

# 5. Weather by zipcode (default country)
curl http://localhost:4000/v1/weather/zipcode/10001

# 6. Weather with metric units (Celsius)
curl http://localhost:4000/v1/weather/units/Paris/metric

# 7. Weather with imperial units (Fahrenheit)
curl http://localhost:4000/v1/weather/units/New%20York/imperial

# 8. Weather in Spanish language
curl http://localhost:4000/v1/weather/language/Madrid/es

# 9. Weather in French language
curl http://localhost:4000/v1/weather/language/Paris/fr

# 10. Weather with all parameters combined
curl http://localhost:4000/v1/weather/combined/Tokyo/metric/es

# 11. Enhanced weather with all parameters combined
curl http://localhost:4000/v1/weather-enhanced/combined/Tokyo/metric/es

# 12. Forecast by time intervals (6 hours)
curl http://localhost:4000/v1/forecast/interval/London/6h

# 13. Enhanced forecast by time intervals (12 hours)
curl http://localhost:4000/v1/forecast-enhanced/interval/Paris/12h

# 14. Forecast by specific days (3 days)
curl http://localhost:4000/v1/forecast/days/Tokyo/3

# 15. Enhanced forecast by specific days (5 days)
curl http://localhost:4000/v1/forecast-enhanced/days/New%20York/5

# 16. Forecast by time periods (morning)
curl http://localhost:4000/v1/forecast/hourly/Madrid/morning

# 17. Enhanced forecast by time periods (afternoon)
curl http://localhost:4000/v1/forecast-enhanced/hourly/Berlin/afternoon

# 18. Forecast by weeks (2 weeks)
curl http://localhost:4000/v1/forecast/weekly/London/2

# 19. Enhanced forecast by weeks (3 weeks)
curl http://localhost:4000/v1/forecast-enhanced/weekly/Paris/3

# 20. Forecast by events (weekend)
curl http://localhost:4000/v1/forecast/events/Tokyo/weekend

# 21. Enhanced forecast by events (holiday)
curl http://localhost:4000/v1/forecast-enhanced/events/New%20York/holiday

# 22. Forecast comparison (today vs tomorrow)
curl http://localhost:4000/v1/forecast/compare/Madrid/today/tomorrow

# 23. Enhanced forecast comparison (weekend vs next_week)
curl http://localhost:4000/v1/forecast-enhanced/compare/Berlin/weekend/next_week
```

### 🧪 Automated Testing

Run the automated test script to verify all endpoints:

```bash
# Make sure the server is running first
npm start

# In another terminal, run the test script
node test-weather-endpoints.js
```

### 📚 Complete Documentation

For detailed information about all weather endpoints, see:

*   [WEATHER\_ENDPOINTS.md](./WEATHER_ENDPOINTS.md) - Complete endpoint documentation
*   [OpenWeatherMap API Documentation](https://openweathermap.org/api) - Official API reference

</details>

<br>

## Section 3) Functionality Testing and References.

### 3.1) Functionality test [🔝](#index-)

<details>
  <summary>See</summary>

<br>

</details>

### 3.2) References [🔝](#índice-)

<details>
  <summary>See</summary>

 <br>

#### Configuration

*   [How to use Sequelize with Node.js and MySQL](https://jasonwatmore.com/post/2022/06/26/nodejs-mysql-connect-to-mysql-database-with-sequelize-mysql2)
*   [Recommended Video Tutorial](https://www.youtube.com/watch?v=im7THL67z0c)
*   [OpenWeather API Documentation](https://openweathermap.org/api)
*   [OpenWeather API Keys Management](https://home.openweathermap.org/api_keys)

#### Tools

*   [AWS Design Tool app.diagrams.net](https://app.diagrams.net/?splash=0\&libs=aws4)

#### Sequelize

*   [Models and Operators](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/)

#### Free market

*   [Users and applications](https://developers.mercadolibre.com.ar/es_ar/usuarios-y-aplicaciones)
*   [Description of users](https://developers.mercadolibre.com.ar/es_ar/producto-consulta-usuarios)

#### Swagger with Serverless

*   [Autoswagger](https://www.npmjs.com/package/serverless-auto-swagger)
*   [Documentation serverless api](https://levelup.gitconnected.com/documenting-your-serverless-solutions-509f1928564b)

#### Open Apiv3 with Serverless

*   [serverless open api ](https://www.serverless.com/plugins/serverless-openapi-documentation)

#### API Gateway

*   [Best Api-Gateway Practices](https://docs.aws.amazon.com/whitepapers/latest/best-practices-api-gateway-private-apis-integration/rest-api.html)
*   [Creating Custom Api-keys](https://towardsaws.com/protect-your-apis-by-creating-api-keys-using-serverless-framework-fe662ad37447)
*   [Gateway Api properties configuration](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml)

#### Serverless frameworks

*   [Plugins](https://www.serverless.com/plugins)

#### Libraries/Plugins

*   [Field validation](https://www.npmjs.com/package/node-input-validator)
*   [serverless-offline-ssm](https://www.serverless.com/plugins/serverless-offline-ssm)
*   [serverless open api ](https://www.serverless.com/plugins/serverless-openapi-documentation)

#### Jest

*   [Environment vars solution](https://stackoverflow.com/questions/48033841/test-process-env-with-jest)

<br>

</details>
