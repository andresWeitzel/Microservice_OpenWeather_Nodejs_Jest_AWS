![Index app](./doc/assets/img/open-weather.jpg)

<div align="right">
  <img width="25" height="25" src="./doc/assets/icons/devops/png/aws.png" />
  <img width="25" height="25" src="./doc/assets/icons/aws/png/lambda.png" />
  <img width="27" height="27" src="./doc/assets/icons/devops/png/postman.png" />
  <img width="29" height="27" src="./doc/assets/icons/devops/png/git.png" />
  <img width="28" height="27" src="./doc/assets/icons/aws/png/api-gateway.png" />
  <img width="23" height="25" src="./doc/assets/icons/aws/png/sqs.png" />
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

# Microservice OpenWeather Nodejs Jest AWS

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
*   [1.1) Project execution.](#11-project-execution-)
*   [1.2) Project setup from scratch](#12-project-setup-from-scratch-)
    *   [1.2.1) OpenWeather API Configuration](#121-openweather-api-configuration)
*   [1.2.2) API Key Security Best Practices](#122-api-key-security-best-practices)
*   [1.2.3) OpenWeather API Endpoints Used](#123-openweather-api-endpoints-used)
*   [1.2.4) Rate Limits and Pricing](#124-rate-limits-and-pricing)
*   [1.2.5) Troubleshooting](#125-troubleshooting)
*   [1.2.6) Additional Resources](#126-additional-resources)
*   [1.2.7) Support](#127-support)
*   [1.3) Technologies.](#13-technologies-)

### Sección 2) Endpoints and Examples

*   [2.0) Endpoints and resources.](#20-endpoints-and-resources-)
*   [2.1) Examples.](#21-examples-)
*   [2.5) Data Persistence and Storage.](#25-data-persistence-and-storage-)

### Sección 3) Functionality test and references

*   [3.0) Functionality test.](#30-functionality-test-and-references-)
*   [3.1) References.](#31-references-)

<br>

</details>

<br>

## Sección 1) Description, configuration and technologies.

### 1.0) Description [🔝](#index-)

<details>
  <summary>See</summary>

 <br>

### 1.0.0) General description

### 1.0.1) Description Architecture and Operation

<br>

</details>

### 1.1) Project execution [🔝](#index-)

<details>
  <summary>See</summary>
<br>

<br>

</details>

### 1.2) Project setup from scratch [🔝](#index-)

<details>
  <summary>Ver</summary>

 <br>

#### 1.2.1) OpenWeather API Configuration

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

#### 1.2.2) API Key Security Best Practices

*   ✅ **Wait for activation** - New keys take up to 2 hours to activate
*   ✅ **Keep your API key private** - Never share it publicly
*   ✅ **Use environment variables** - Don't hardcode in source code
*   ✅ **Monitor usage** - Stay within free tier limits (1,000 calls/day)
*   ✅ **Rotate keys** - Create new keys if compromised
*   ❌ **Don't test immediately** - You'll get 401 errors until activation
*   ❌ **Don't commit to git** - Add config files to .gitignore
*   ❌ **Don't share in logs** - Avoid logging API keys

#### 1.2.3) OpenWeather API Endpoints Used

This microservice uses the **Current Weather Data** endpoint:

*   **Base URL**: `https://api.openweathermap.org/data/2.5/weather`
*   **Method**: GET
*   **Parameters**:
    *   `q`: City name (e.g., "London", "New York")
    *   `appid`: Your API key
*   **Response**: JSON with weather data including temperature, humidity, wind, etc.

#### 1.2.4) Rate Limits and Pricing

| Plan | Calls/Day | Features |
|------|-----------|----------|
| Free | 1,000 | Current weather, 5-day forecast |
| Starter | 100,000 | Extended forecast, historical data |
| Business | 1,000,000 | All features, priority support |

*   **Response Time**: Usually under 200ms
*   **Data Update**: Every 10 minutes

#### 1.2.5) Troubleshooting

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

#### 1.2.6) Additional Resources

*   [OpenWeather API Documentation](https://openweathermap.org/api)
*   [API Key Management](https://home.openweathermap.org/api_keys)
*   [Weather Conditions Codes](https://openweathermap.org/weather-conditions)
*   [Support Forum](https://openweathermap.org/forum)

#### 1.2.7) Support

If you continue to have issues:

1.  Check the [OpenWeather FAQ](https://openweathermap.org/faq)
2.  Visit the [OpenWeather Forum](https://openweathermap.org/forum)
3.  Contact OpenWeather support for API-specific issues
4.  Check this project's issues for known problems

<br>

</details>

### 1.3) Technologies [🔝](#index-)

<details>
  <summary>See</summary>

 <br>

| **Technologies** | **Version** | **Purpose** |
| ------------- | ------------- | ------------- |
| [SDK](https://www.serverless.com/framework/docs/guides/sdk/) | 4.3.2  | Automatic Module Injection for Lambdas |
| [Serverless Framework Core v3](https://www.serverless.com//blog/serverless-framework-v3-is-live) | 3.23.0 | Core Services AWS |
| [Systems Manager Parameter Store (SSM)](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) | 3.0 | Management of Environment Variables |
| [Jest](https://jestjs.io/) | 29.7 | Framework para pruebas unitarias, integración, etc. |
| [Amazon Api Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) | 2.0 | API Manager, Authentication, Control and Processing |
| [NodeJS](https://nodejs.org/en/) | 14.18.1  | js library |
| [Sequelize](https://sequelize.org/) | ^6.11.0 | ORM |
| [Mysql](https://www.mysql.com/) | 10.1 | SGDB |
| [XAMPP](https://www.apachefriends.org/es/index.html) | 3.2.2 | Server package |
| [VSC](https://code.visualstudio.com/docs) | 1.72.2  | IDE |
| [Postman](https://www.postman.com/downloads/) | 10.11  | http client |
| [CMD](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd) | 10 | Símbolo del Sistema para linea de comandos |
| [Git](https://git-scm.com/downloads) | 2.29.1  | Version control |
| Otros | Otros | Otros |

</br>

| **Plugin** |
| -------------  |
| [Serverless Plugin](https://www.serverless.com/plugins/) |
| [serverless-offline](https://www.npmjs.com/package/serverless-offline) |
| [serverless-offline-ssm](https://www.npmjs.com/package/serverless-offline-ssm) |

</br>

| **Extensión** |
| -------------  |
| Prettier - Code formatter |
| YAML - Autoformatter .yml |
| Error Lens - for errors and indent |
| Tabnine - IA Code |
| Otros - Otros |

<br>

</details>

<br>

## Sección 2) Endpoints and Examples.

### 2.0) Endpoints and resources [🔝](#index-)

<details>
  <summary>See</summary>

<br>

#### Available Endpoints

> **📝 Note**: All endpoints accept both **cities** and **countries** as location parameters. The API uses OpenWeather's geocoding service to resolve any location name to coordinates.

**🔍 Location Search Examples:**
- **Cities**: `London`, `New York`, `Tokyo`, `Paris`, `Buenos Aires`
- **Countries**: `Japan`, `Australia`, `Brazil`, `Germany`, `Argentina`
- **States/Provinces**: `California`, `Ontario`, `Bavaria`
- **Special cases**: For large countries, the API will return data for the capital or a major city

**💾 Data Persistence**: After successfully retrieving data from OpenWeather API, the microservice automatically saves the response to JSON files in the `src/data/json/` directory for backup and reference purposes.

| **Endpoint** | **Method** | **Description** | **Response** |
|-------------|------------|-----------------|--------------|
| `/v1/weather/location/{location}` | GET | Raw OpenWeather data | Original OpenWeather format |
| `/v1/weather-enhanced/location/{location}` | GET | **Enhanced weather data** | **Enriched format with conversions, recommendations, and alerts** |
| `/v1/forecast/location/{location}` | GET | Raw OpenWeather forecast | Original OpenWeather forecast format |
| `/v1/forecast-enhanced/location/{location}` | GET | **Enhanced forecast data** | **Enriched format with daily summaries, trends, and planning recommendations** |
| `/v1/air-pollution/location/{location}` | GET | Raw OpenWeather air pollution | Original OpenWeather air pollution format |
| `/v1/air-pollution-enhanced/location/{location}` | GET | **Enhanced air pollution data** | **Enriched format with health recommendations, alerts, and detailed analysis** |
| `/health` | GET | **System health check** | **API connectivity, cache status, and system metrics** |

#### Enhanced Weather Features

The enhanced endpoint provides the following additional features:

**🌡️ Temperature Conversions**

*   Kelvin, Celsius, and Fahrenheit in one response
*   "Feels like" temperature in all units

**📍 Location Context**

*   City and country information
*   Coordinates and timezone
*   Local time and daytime status

**🌤️ Weather Intelligence**

*   Weather severity classification (light, moderate, heavy)
*   Personalized recommendations based on conditions
*   Wind descriptions (Calm, Light breeze, etc.)

**⚠️ Smart Alerts**

*   Temperature warnings (freezing, extreme heat)
*   Wind alerts for strong conditions
*   Visibility warnings

**👕 Personalized Recommendations**

*   Clothing suggestions based on temperature
*   Activity recommendations (indoor/outdoor)
*   Transport advice
*   Health recommendations

**😌 Comfort Analysis**

*   Comfort index (0-10 scale)
*   Comfort level classification
*   Based on temperature, humidity, and wind

**☀️ Sun Information**

*   Sunrise and sunset times (formatted)
*   Day length calculation
*   Daytime status

#### Enhanced Forecast Features

The enhanced forecast endpoint provides the following additional features:

**📅 Daily Summaries**

*   Grouped forecast data by day
*   Daily temperature ranges (min/max)
*   Average humidity, pressure, and wind
*   Total precipitation per day

**📊 Trend Analysis**

*   Temperature trends (warming/cooling/stable)
*   Weather condition changes
*   Precipitation patterns

**⚠️ Forecast Alerts**

*   Extreme temperature warnings
*   Strong wind alerts
*   Heavy precipitation warnings

**🎯 Planning Recommendations**

*   Best days for outdoor activities
*   Clothing recommendations for the period
*   Health and safety advice
*   Activity planning suggestions

**📈 Statistical Summary**

*   Average temperatures for the period
*   Total precipitation amounts
*   Wind speed analysis
*   Weather condition frequency

#### Enhanced Air Pollution Features

The enhanced air pollution endpoint provides the following additional features:

**🌬️ Air Quality Intelligence**

*   Air Quality Index (AQI) with color coding
*   Detailed pollutant analysis (CO, NO2, O3, PM2.5, PM10, etc.)
*   Health implications for each AQI level
*   Real-time air quality assessment

**🏥 Health & Safety Analysis**

*   Health risk level assessment
*   Vulnerable groups identification
*   Potential health symptoms
*   Prevention measures and recommendations

**⚠️ Smart Air Pollution Alerts**

*   High pollutant level warnings
*   AQI-based alerts
*   Specific pollutant alerts (PM2.5, Ozone, etc.)
*   Health risk notifications

**🎯 Personalized Recommendations**

*   Outdoor activity recommendations
*   Exercise guidelines based on air quality
*   Ventilation recommendations
*   Transportation suggestions

**📊 Detailed Pollutant Analysis**

*   Individual pollutant levels and descriptions
*   Carbon monoxide, nitrogen oxides, ozone
*   Particulate matter (PM2.5, PM10)
*   Sulfur dioxide and ammonia levels

**🏃 Activity Guidelines**

*   Safe outdoor activity recommendations
*   Exercise intensity guidelines
*   Indoor air quality management
*   Transportation mode suggestions

</details>

### 2.1) Examples [🔝](#index-)

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

#### Basic Air Pollution Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/air-pollution/location/London
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "coord": {"lon": -0.1276, "lat": 51.5074},
    "list": [
      {
        "dt": 1640995200,
        "main": {"aqi": 2},
        "components": {
          "co": 447.21,
          "no": 0.18,
          "no2": 0.71,
          "o3": 68.04,
          "so2": 0.64,
          "pm2_5": 4.67,
          "pm10": 6.04,
          "nh3": 0.92
        }
      }
    ],
    "location": {
      "city": "London",
      "country": "GB",
      "state": "England",
      "coordinates": {
        "lat": 51.5074,
        "lon": -0.1276
      }
    }
  }
}
```

#### Enhanced Air Pollution Endpoint

**Request:**

```bash
GET http://localhost:4000/v1/air-pollution-enhanced/location/London
```

**Response:**

```json
{
  "statusCode": 200,
  "body": {
    "location": {
      "city": "London",
      "country": "GB",
      "state": "England",
      "coordinates": {"lon": -0.1276, "lat": 51.5074},
      "timestamp": "2022-01-01T12:00:00.000Z"
    },
    "airQuality": {
      "index": 2,
      "level": "Fair",
      "description": "Air quality is acceptable, however some pollutants may be a concern for a small number of people",
      "color": "#ffde33",
      "healthImplications": "Minor health implications for sensitive individuals"
    },
    "pollutants": {
      "carbonMonoxide": {
        "value": 447.21,
        "unit": "μg/m³",
        "level": "High",
        "description": "Carbon monoxide - a colorless, odorless gas that can be harmful when inhaled"
      },
      "nitrogenOxide": {
        "value": 0.18,
        "unit": "μg/m³",
        "level": "Low",
        "description": "Nitric oxide - a gas that contributes to air pollution"
      },
      "nitrogenDioxide": {
        "value": 0.71,
        "unit": "μg/m³",
        "level": "Low",
        "description": "Nitrogen dioxide - a gas that can irritate the lungs"
      },
      "ozone": {
        "value": 68.04,
        "unit": "μg/m³",
        "level": "Moderate",
        "description": "Ozone - a gas that can cause respiratory problems"
      },
      "sulfurDioxide": {
        "value": 0.64,
        "unit": "μg/m³",
        "level": "Low",
        "description": "Sulfur dioxide - a gas that can irritate the respiratory system"
      },
      "particulateMatter25": {
        "value": 4.67,
        "unit": "μg/m³",
        "level": "Low",
        "description": "Fine particulate matter - tiny particles that can penetrate deep into the lungs"
      },
      "particulateMatter10": {
        "value": 6.04,
        "unit": "μg/m³",
        "level": "Low",
        "description": "Coarse particulate matter - larger particles that can irritate the respiratory system"
      },
      "ammonia": {
        "value": 0.92,
        "unit": "μg/m³",
        "level": "Moderate",
        "description": "Ammonia - a gas that can contribute to air pollution"
      }
    },
    "alerts": [
      {
        "type": "carbon_monoxide",
        "level": "moderate",
        "message": "Elevated carbon monoxide levels detected"
      }
    ],
    "recommendations": {
      "general": "Air quality is acceptable, however some pollutants may be a concern for a small number of people",
      "outdoor": "Outdoor activities are generally safe",
      "indoor": "Normal indoor activities",
      "health": "Monitor symptoms if you have respiratory conditions",
      "transportation": "Normal transportation methods"
    },
    "health": {
      "riskLevel": "Low to Moderate",
      "vulnerableGroups": [
        "Children",
        "Elderly",
        "People with respiratory conditions"
      ],
      "symptoms": ["None expected"],
      "prevention": ["Monitor air quality regularly"]
    },
    "activities": {
      "outdoor": "Safe for all outdoor activities",
      "exercise": "Outdoor exercise is safe",
      "ventilation": "Normal ventilation is fine",
      "transportation": "All transportation methods are fine"
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

# Test air pollution endpoints
curl http://localhost:4000/v1/air-pollution/location/Beijing
curl http://localhost:4000/v1/air-pollution-enhanced/location/Delhi
```

#### Testing with Postman

1.  **Basic Weather:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather/location/London`

2.  **Enhanced Weather:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/weather-enhanced/location/London`

3.  **Basic Air Pollution:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/air-pollution/location/London`

4.  **Enhanced Air Pollution:**
    *   Method: `GET`
    *   URL: `http://localhost:4000/v1/air-pollution-enhanced/location/London`

</details>

<br>

## Section 2.5) Data Persistence and Storage [🔝](#index-)

<details>
  <summary>See</summary>

<br>

### 📁 Data Storage Structure

The microservice automatically saves API responses to JSON files for backup, debugging, and reference purposes. This feature ensures data persistence and provides a local cache of recent API calls.

#### Storage Locations

```
src/data/json/
├── weather/
│   ├── weather-data.json              # Basic weather data
│   └── weather-enhanced-data.json     # Enhanced weather data
├── forecast/
│   ├── forecast-data.json             # Basic forecast data
│   └── forecast-enhanced-data.json    # Enhanced forecast data
├── air-pollution/
│   ├── air-pollution-data.json        # Basic air pollution data
│   └── air-pollution-enhanced-data.json  # Enhanced air pollution data
└── weather-condition/
    └── (weather condition data)
```

#### How It Works

1. **API Call**: When an endpoint is called, the microservice fetches data from OpenWeather API
2. **Data Processing**: The response is processed and transformed (if enhanced endpoint)
3. **Async JSON Storage**: The processed data is automatically saved to the corresponding JSON file **asynchronously** (non-blocking)
4. **Immediate Response**: The data is returned to the client immediately, without waiting for file write completion

#### Benefits

- **🔍 Debugging**: Easy access to recent API responses for troubleshooting
- **📊 Data Analysis**: Historical data for analysis and development
- **🛡️ Backup**: Local backup of API responses in case of external API issues
- **⚡ Development**: Faster development and testing with local data access
- **🚀 Performance**: Reduces API calls through intelligent caching system

#### File Management

- **Automatic Updates**: Files are updated with each successful API call
- **Overwrite Policy**: Each new request overwrites the previous data
- **Non-Blocking Writes**: JSON files are written asynchronously to avoid blocking API responses
- **Error Handling**: If file creation fails, the API still returns data to the client (with warning logs)
- **Storage Location**: Files are stored in the `src/data/json/` directory structure
- **Enhanced Endpoints**: All enhanced endpoints now save their transformed data to separate JSON files

#### Caching System

The microservice implements a **dual-layer caching strategy**:

1. **Memory Cache**: Fast in-memory cache for frequently accessed data
   - **Duration**: 10 minutes for weather data
   - **Storage**: RAM-based for ultra-fast access
   - **Eviction**: Automatic cleanup of expired entries

2. **JSON File Storage**: Persistent storage for backup and debugging
   - **Duration**: Permanent until overwritten
   - **Storage**: File system for data persistence
   - **Purpose**: Backup, debugging, and development reference

**Cache Flow:**
```
API Request → Check Memory Cache → If not found → Call OpenWeather API → Store in Memory Cache → Save to JSON File (async) → Return Response Immediately
```

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

## Section 3) Functionality Testing and References.

### 3.0) Functionality test [🔝](#index-)

<details>
  <summary>See</summary>

<br>

</details>

### 3.1) References [🔝](#índice-)

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
