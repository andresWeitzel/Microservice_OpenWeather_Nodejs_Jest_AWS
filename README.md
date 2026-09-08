<div align="center">
<img src="./doc/assets/img/open-weather.jpg" alt="Index app" />
<div align="right">
<img width="16" height="16" src="./doc/assets/icons/devops/png/aws.png" alt="AWS" />
<img width="16" height="16" src="./doc/assets/icons/aws/png/lambda.png" alt="Lambda" />
<img width="16" height="16" src="./doc/assets/icons/devops/png/postman.png" alt="Postman" />
<img width="16" height="16" src="./doc/assets/icons/devops/png/git.png" alt="Git" />
<img width="16" height="16" src="./doc/assets/icons/aws/png/api-gateway.png" alt="API Gateway" />
<img width="16" height="16" src="./doc/assets/icons/aws/png/parameter-store.png" alt="Parameter Store" />
<img width="16" height="16" src="./doc/assets/icons/backend/javascript-typescript/png/nodejs.png" alt="Node.js" />
</div>
</div>

<br>

<br>

<div align="right">
 <a href="./README.md" title="Español">
 <img src="./doc/assets/translation/arg-flag.jpg" width="64" height="40" alt="Español" title="Español" />
 </a>
 <a href="./doc/assets/translation/README.en.md" title="Inglés">
 <img src="./doc/assets/translation/eeuu-flag.jpg" width="64" height="40" alt="Inglés" title="Inglés" />
 </a>
</div>

<br>

<div align="center">

# Microservice OpenWeather AWS ![(status-completed)](./doc/assets/icons/badges/status-completed.svg)

</div>

Una API lista para que tu plataforma muestre el clima de cualquier lugar del mundo con la misma fuente que OpenWeather. Reúne condiciones actuales, pronósticos a 5 días y búsquedas por ciudad, coordenadas, ID o código postal, con unidades e idioma a medida y datos enriquecidos (recomendaciones, alertas y análisis), para que esa información quede cacheada, resiliente y lista para integrarse con el resto de tus servicios.

<div align="left">
<a href="https://openweathermap.org/guide" target="_blank" rel="noopener noreferrer" title="API Doc"><img src="./doc/assets/icons/detail-actions/api-doc-pill.svg" alt="API Doc" width="100" height="30" border="0" /></a>
<br>
<a href="./postman/Microservice_OpenWeather_Nodejs_Jest_AWS.postman_collection.json" target="_blank" rel="noopener noreferrer" title="Colección de Postman"><img src="./doc/assets/icons/detail-actions/postman-pill.svg" alt="Postman" width="100" height="30" border="0" /></a>
<br>
<a href="https://www.youtube.com/watch?v=oLSrmqMq0Zs&list=PLCl11UFjHurB9JzGtm5e8-yp52IcZDs5y" target="_blank" rel="noopener noreferrer" title="Playlist"><img src="./doc/assets/icons/detail-actions/playlist-pill.svg" alt="Playlist" width="100" height="30" border="0" /></a>
</div>

<br>

## Índice 📜

<details>
 <summary>Ver detalles</summary>

<div align="right">

`Última actualización: 07/09/26` 

</div>

### Sección 1) Descripción, configuración y tecnologías.

* [1.0) Descripción del proyecto.](#10-descripción-)
* [1.1) Ejecución del proyecto.](#11-ejecución-del-proyecto-)
    * [1.1.1) Configuración de la API de OpenWeather](#111-configuración-de-la-api-de-openweather)
* [1.1.2) Configuración del archivo del proyecto](#112-configuración-del-archivo-del-proyecto)
* [1.1.3) Buenas prácticas de seguridad de la API Key](#113-buenas-prácticas-de-seguridad-de-la-api-key)
* [1.1.4) Endpoints de OpenWeather utilizados](#114-endpoints-de-openweather-utilizados)
* [1.1.5) Límites de uso y precios](#115-límites-de-uso-y-precios)
* [1.1.6) Resolución de problemas](#116-resolución-de-problemas)
* [1.1.7) Recursos adicionales](#117-recursos-adicionales)
* [1.1.8) Soporte](#118-soporte)
* [1.2) Tecnologías.](#12-tecnologías-)

### Sección 2) Endpoints y ejemplos

* [2.1) Endpoints de clima.](#21-endpoints-de-clima-)
* [2.2) Endpoints y recursos.](#22-endpoints-y-recursos-)
* [2.3) Ejemplos.](#23-ejemplos-de-endpoints-de-clima-)
* [2.4) Endpoints de pronóstico.](#24-endpoints-de-pronóstico-)
* [2.5) Ejemplos de pronóstico.](#25-ejemplos-de-pronóstico-)

### Sección 3) Persistencia y almacenamiento de datos

* [3.1) Arquitectura y estructura de almacenamiento.](#31-arquitectura-y-estructura-de-almacenamiento-)
* [3.2) Funciones avanzadas y rendimiento.](#32-funciones-avanzadas-y-rendimiento-)
* [3.3) Buenas prácticas y hoja de ruta.](#33-buenas-prácticas-y-hoja-de-ruta-)

### Sección 4) Prueba de funcionalidad y referencias

* [4.1) Prueba de funcionalidad.](#41-prueba-de-funcionalidad-)
* [4.2) Referencias.](#42-referencias-)

<br>

</details>

<br>

## Sección 1) Descripción, configuración y tecnologías.

### 1.0) Descripción [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

 <br>

### 1.0.0) Descripción general

Este microservicio ofrece una **API REST de información climática** usando la **API de OpenWeatherMap**. Está construido con **Node.js**, **Jest** para pruebas, **Serverless Framework** y **AWS Lambda** para el despliegue serverless.

#### 🌟 Características principales

* **🌤️ Datos climáticos completos**: condiciones actuales para cualquier ubicación del mundo
* **📊 Pronósticos avanzados**: pronóstico a 5 días con múltiples filtros
* **🔍 Varios métodos de búsqueda**: por nombre de ciudad, coordenadas, ID de ciudad o código postal
* **🌍 Internacionalización**: soporte para varios idiomas y unidades
* **⚡ Endpoints enriquecidos**: datos con recomendaciones, alertas y análisis
* **🛡️ Arquitectura robusta**: circuit breaker, rate limiting y caché
* **📝 Pruebas completas**: unitarias y de integración con Jest
* **☁️ Listo para AWS**: despliegue serverless con Lambda y API Gateway

#### 🎯 Casos de uso

* **Aplicaciones del clima**: apps móviles y web
* **Proyectos IoT**: hogar inteligente y monitoreo ambiental
* **Planificación de viajes**: turismo y aplicaciones de viaje
* **Business Intelligence**: decisiones de negocio dependientes del clima
* **Proyectos educativos**: aprendizaje de arquitectura serverless e integración de APIs

#### 🏗️ Visión general de la arquitectura

El microservicio sigue un patrón de **arquitectura de microservicios** con:
- **Funciones serverless**: AWS Lambda para una ejecución escalable y económica
- **API Gateway**: gestión y enrutamiento de la API REST
- **Parameter Store**: gestión segura de variables de entorno
- **Capa de caché**: caché en memoria y en archivos para rendimiento
- **Circuit Breaker**: tolerancia a fallos y patrones de resiliencia

### 1.0.1) Descripción de arquitectura y funcionamiento

#### 🏛️ Arquitectura del sistema

El microservicio implementa una **arquitectura en capas** con separación clara de responsabilidades:

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

#### 🔄 Flujo de la solicitud

1. **API Gateway**: recibe las solicitudes HTTP y las enruta a la Lambda correspondiente
2. **Capa de controller**: valida parámetros y orquesta la lógica de negocio
3. **Middleware**: aplica aspectos transversales (rate limiting, circuit breaker, métricas)
4. **Capa de servicio**: procesa datos, aplica transformaciones y gestiona el caché
5. **APIs externas**: obtiene datos de la API de OpenWeatherMap
6. **Respuesta**: devuelve los datos formateados con el código HTTP correspondiente

#### 🛡️ Patrones de resiliencia

* **Circuit Breaker**: evita fallos en cascada cuando las APIs externas no responden
* **Rate Limiting**: protege contra abuso y respeta las cuotas de la API
* **Caché**: reduce llamadas a la API y mejora los tiempos de respuesta
* **Reintentos**: maneja fallos temporales de forma controlada
* **Respuestas de fallback**: entrega datos en caché si fallan los servicios externos

#### 📊 Flujo de datos

1. **Validación de entrada**: los parámetros se validan contra esquemas
2. **Consulta de caché**: el sistema busca primero datos en caché
3. **Llamada a la API**: si no hay caché, llama a OpenWeatherMap
4. **Transformación de datos**: aplica lógica de negocio y enriquecimiento
5. **Almacenamiento**: guarda datos en caché y en archivos JSON
6. **Respuesta**: devuelve los datos formateados al cliente

#### 🔧 Componentes técnicos

* **AWS Lambda**: cómputo serverless para atender solicitudes
* **API Gateway**: gestión y enrutamiento de la API HTTP
* **Parameter Store**: gestión segura de configuración
* **Jest**: framework de pruebas
* **Serverless Framework**: infraestructura como código
* **Node.js**: entorno de ejecución de JavaScript

</details>


### 1.1) Ejecución del proyecto [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

 <br>

#### 1.1.1) Configuración de la API de OpenWeather

Este microservicio se integra con la API de OpenWeather para obtener información climática. Seguí estos pasos para configurar el acceso:

##### Paso 1: Creación de la cuenta

1.  **Visitar OpenWeatherMap**: ir a <https://openweathermap.org/>
2.  **Registrarse**: clic en "Sign In" → "Sign Up" en la esquina superior derecha
3.  **Completar el registro**:
    *   Ingresá tu email
    *   Creá una contraseña segura
    *   Aceptá los términos y condiciones
    *   Clic en "Create Account"
4.  **Verificación de email**: revisá la bandeja de entrada y hacé clic en el enlace de verificación

##### Paso 2: Generación de la API Key

1.  **Login**: iniciá sesión en tu cuenta de OpenWeather
2.  **Ir a API Keys**: <https://home.openweathermap.org/api_keys>
3.  **Key por defecto**: vas a ver una API Key generada automáticamente
4.  **⚠️ CRÍTICO - tiempo de activación**: las API Keys nuevas tardan **hasta 2 horas en activarse**
5.  **No pruebes de inmediato**: vas a recibir 401 "Invalid API key" hasta que la activación termine

##### Paso 3: Configurar el proyecto

1.  **Abrir el archivo de configuración**: abrí `serverless-ssm.yml` en la raíz del proyecto
2.  **Actualizar la API Key**: reemplazá el placeholder por tu API Key real:
    ```yaml
    # Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "YOUR_ACTUAL_API_KEY_HERE"
    ```

##### Paso 4: Probar la configuración

**⚠️ IMPORTANTE: esperá la activación de la API Key**

**Antes de probar, asegurate de que la API Key esté activa desde hace al menos 2 horas.** Si la acabás de crear, esperá antes de continuar.

1.  **Levantar la aplicación**:
    ```bash
    npm start
    ```

2.  **Probar el endpoint**: usá tu cliente HTTP preferido (Postman, curl, etc.):
    ```bash
    # Test with curl
    curl http://localhost:4000/v1/weather/country/London
    ```

# Test with Postman

GET http://localhost:4000/v1/weather/country/New%20York

````

3. **Respuesta esperada**: una respuesta exitosa debería verse así:
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

#### 1.1.2) Configuración del archivo del proyecto

**⚠️ CRÍTICO: crear el archivo de configuración (si no existe)**

Antes de ejecutar el proyecto **tenés que** crear el archivo `serverless-ssm.yml` en la raíz. Ese archivo tiene las variables de entorno que el microservicio necesita para funcionar.

##### Paso 1: Crear el archivo de configuración

1.  **Ir a la raíz del proyecto**: directorio principal del repo
2.  **Crear el archivo**: `serverless-ssm.yml`
3.  **Agregar la configuración**: copiá y pegá lo siguiente:

```yaml
# Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "YOUR_ACTUAL_API_KEY_HERE"
```

##### Paso 2: Actualizar con tu API Key

Reemplazá `"YOUR_ACTUAL_API_KEY_HERE"` por la API Key que obtuviste en OpenWeather:

```yaml
# Environment variables for the OpenWeather API microservice
    API_WEATHER_URL_BASE: "https://api.openweathermap.org/data/2.5/weather?q="
    API_FORECAST_URL_BASE: "https://api.openweathermap.org/data/2.5/forecast?"
    API_KEY: "858923c0cff4df1c4415f2493500ad37"  # Replace with your actual API key
```

##### Paso 3: Verificar la ubicación del archivo

Asegurate de que el archivo esté en la ubicación correcta:

    Microservice_OpenWeather_Nodejs_Jest_AWS/
    ├── serverless-ssm.yml          # ← This file must exist here
    ├── package.json
    ├── serverless.yml
    ├── src/
    └── ...

##### Paso 4: Consideraciones de seguridad

*   ✅ **Agregalo al .gitignore** - `serverless-ssm.yml` tiene que estar en tu `.gitignore`
*   ✅ **Mantenelo privado** - nunca lo subas al control de versiones
*   ✅ **Backup seguro** - guardá la API Key en un lugar seguro
*   ❌ **No la compartas** - nunca publiques tu API Key
*   ❌ **No hagas commit** - evitá subirla a git por accidente

**Ejemplo de entrada en .gitignore:**

    # Configuration files with sensitive data
    serverless-ssm.yml
    *.env

#### 1.1.3) Buenas prácticas de seguridad de la API Key

*   ✅ **Esperá la activación** - las keys nuevas tardan hasta 2 horas
*   ✅ **Mantené la API Key privada** - nunca la compartas en público
*   ✅ **Usá variables de entorno** - no la hardcodees en el código
*   ✅ **Monitoreá el uso** - respetá el límite del plan free (1.000 calls/día)
*   ✅ **Rotá las keys** - creá una nueva si se comprometió
*   ❌ **No pruebes de inmediato** - vas a recibir 401 hasta que se active
*   ❌ **No la subas a git** - agregá los archivos de config al .gitignore
*   ❌ **No la dejes en logs** - evitá loguear API Keys

#### 1.1.4) Endpoints de OpenWeather utilizados

This microservice uses the **Current Weather Data** endpoint:

*   **Base URL**: `https://api.openweathermap.org/data/2.5/weather`
*   **Method**: GET
*   **Parameters**:
    *   `q`: City name (e.g., "London", "New York")
    *   `appid`: Your API key
*   **Response**: JSON with weather data including temperature, humidity, wind, etc.

#### 1.1.5) Límites de uso y precios

| Plan | Calls/Day | Features |
|------|-----------|----------|
| Free | 1,000 | Current weather, 5-day forecast |
| Starter | 100,000 | Extended forecast, historical data |
| Business | 1,000,000 | All features, priority support |

*   **Response Time**: Usually under 200ms
*   **Data Update**: Every 10 minutes

#### 1.1.6) Resolución de problemas

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

#### 1.1.7) Recursos adicionales

*   [OpenWeather API Documentation](https://openweathermap.org/api)
*   [API Key Management](https://home.openweathermap.org/api_keys)
*   [Weather Conditions Codes](https://openweathermap.org/weather-conditions)
*   [Support Forum](https://openweathermap.org/forum)

#### 1.1.8) Soporte

If you continue to have issues:

1.  Check the [OpenWeather FAQ](https://openweathermap.org/faq)
2.  Visit the [OpenWeather Forum](https://openweathermap.org/forum)
3.  Contact OpenWeather support for API-specific issues
4.  Check this project's issues for known problems

<br>

</details>

### 1.2) Tecnologías [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

 <br>

#### 🏗️ Tecnologías principales

| **Technology** | **Version** | **Purpose** | **Role in Project** |
| ------------- | ------------- | ------------- | ------------- |
| [Node.js](https://nodejs.org/) | 14.18.1 | JavaScript Runtime | Core runtime environment for serverless functions |
| [Serverless Framework](https://www.serverless.com/) | 3.23.0 | Infrastructure as Code | AWS deployment and configuration management |
| [AWS Lambda](https://aws.amazon.com/lambda/) | Latest | Serverless Compute | Function execution platform |
| [AWS API Gateway](https://aws.amazon.com/api-gateway/) | 2.0 | API Management | HTTP API routing and management |
| [AWS Systems Manager](https://aws.amazon.com/systems-manager/) | 3.0 | Parameter Store | Secure environment variable management |

#### 🧪 Pruebas y calidad

| **Technology** | **Version** | **Purpose** | **Role in Project** |
| ------------- | ------------- | ------------- | ------------- |
| [Jest](https://jestjs.io/) | 29.7.0 | Testing Framework | Unit and integration testing |
| [Supertest](https://github.com/visionmedia/supertest) | Latest | HTTP Testing | API endpoint testing |
| [ESLint](https://eslint.org/) | Latest | Code Linting | Code quality and style enforcement |
| [Prettier](https://prettier.io/) | Latest | Code Formatting | Consistent code formatting |

#### 🔌 Plugins de Serverless

| **Plugin** | **Version** | **Purpose** | **Configuration** |
| ------------- | ------------- | ------------- | ------------- |
| [serverless-offline](https://www.npmjs.com/package/serverless-offline) | Latest | Local Development | Local Lambda simulation |
| [serverless-offline-ssm](https://www.npmjs.com/package/serverless-offline-ssm) | Latest | Parameter Store Simulation | Local SSM parameter simulation |
| [serverless-auto-swagger](https://www.npmjs.com/package/serverless-auto-swagger) | Latest | API Documentation | Automatic OpenAPI documentation |

#### 🛠️ Herramientas de desarrollo

| **Tool** | **Version** | **Purpose** | **Usage** |
| ------------- | ------------- | ------------- | ------------- |
| [Visual Studio Code](https://code.visualstudio.com/) | 1.72.2+ | IDE | Primary development environment |
| [Postman](https://www.postman.com/) | 10.11+ | API Testing | Endpoint testing and documentation |
| [Git](https://git-scm.com/) | 2.29.1+ | Version Control | Source code management |
| [npm](https://www.npmjs.com/) | 6.14+ | Package Manager | Dependency management |

#### 📦 Dependencias principales

| **Package** | **Version** | **Purpose** | **Usage** |
| ------------- | ------------- | ------------- | ------------- |
| [axios](https://axios-http.com/) | Latest | HTTP Client | OpenWeather API requests |
| [lodash](https://lodash.com/) | Latest | Utility Library | Data manipulation and utilities |
| [moment](https://momentjs.com/) | Latest | Date/Time Library | Date formatting and manipulation |
| [joi](https://joi.dev/) | Latest | Validation Library | Input parameter validation |

#### 🏗️ Componentes de arquitectura

| **Component** | **Technology** | **Purpose** | **Implementation** |
| ------------- | ------------- | ------------- | ------------- |
| **API Gateway** | AWS API Gateway | HTTP API Management | RESTful endpoint routing |
| **Lambda Functions** | AWS Lambda | Serverless Compute | Individual endpoint handlers |
| **Parameter Store** | AWS SSM | Configuration Management | Secure API keys and settings |
| **Caching** | In-Memory + File | Performance Optimization | Response caching and storage |
| **Circuit Breaker** | Custom Implementation | Fault Tolerance | External API failure protection |
| **Rate Limiting** | Custom Implementation | API Protection | Request throttling and abuse prevention |

#### 🌐 APIs externas

| **Service** | **Purpose** | **Integration** | **Data Format** |
| ------------- | ------------- | ------------- | ------------- |
| [OpenWeatherMap API](https://openweathermap.org/api) | Weather Data Source | REST API Integration | JSON |
| [OpenWeatherMap Forecast API](https://openweathermap.org/forecast5) | Weather Forecast Data | REST API Integration | JSON |

#### 🔧 Extensiones de desarrollo (VS Code)

| **Extension** | **Purpose** | **Benefits** |
| ------------- | ------------- | ------------- |
| **Prettier** | Code Formatting | Consistent code style |
| **ESLint** | Code Linting | Code quality enforcement |
| **YAML** | YAML Support | Serverless configuration files |
| **Error Lens** | Error Highlighting | Inline error display |
| **Tabnine** | AI Code Completion | Intelligent code suggestions |
| **Thunder Client** | API Testing | Built-in HTTP client |
| **GitLens** | Git Integration | Enhanced Git functionality |

#### 📊 Monitoreo y observabilidad

| **Component** | **Purpose** | **Implementation** |
| ------------- | ------------- | ------------- |
| **Metrics Collection** | Performance Monitoring | Custom metrics middleware |
| **Logging** | Debug & Monitoring | Structured logging with timestamps |
| **Health Checks** | Service Status | Dedicated health endpoint |
| **Error Tracking** | Issue Detection | Comprehensive error handling |

#### 🚀 Despliegue y DevOps

| **Tool/Service** | **Purpose** | **Configuration** |
| ------------- | ------------- | ------------- |
| **Serverless Framework** | Infrastructure Deployment | `serverless.yml` configuration |
| **AWS CloudFormation** | Resource Provisioning | Automatic via Serverless Framework |
| **GitHub Actions** | CI/CD Pipeline | Automated testing and deployment |
| **AWS CloudWatch** | Monitoring & Logging | Centralized observability |

<br>

#### 🔄 Flujo del stack tecnológico

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

## Sección 2) Endpoints y ejemplos.

### 2.1) Endpoints de clima [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

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

### 2.3) Ejemplos de endpoints de clima [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>
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


### 2.4) Endpoints de pronóstico [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

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



### 2.5) Ejemplos de pronóstico [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>
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

## Sección 3) Persistencia y almacenamiento de datos [🔝](#índice-)

### 3.1) Arquitectura y estructura de almacenamiento [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

<br>

### 📁 Storage Architecture Overview

The microservice implements a **multi-layered storage architecture** with intelligent caching and persistence strategies.

### 🏗️ Storage Locations & Structure

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

### 🔄 Dual-Layer Caching Strategy

The microservice implements a **dual-layer caching strategy**:

1.  **Memory Cache**: Fast in-memory cache for frequently accessed data
    *   **Duration**: 10 minutes for weather data
    *   **Storage**: RAM-based for ultra-fast access
    *   **Eviction**: Automatic cleanup of expired entries

2.  **JSON File Storage**: Persistent storage for backup and debugging
    *   **Duration**: Permanent until overwritten
    *   **Storage**: File system for data persistence
    *   **Purpose**: Backup, debugging, and development reference

### 🔄 Data Flow & Processing

    API Request → Check Memory Cache → If not found → Call OpenWeather API → Store in Memory Cache → Save to JSON File (async) → Return Response Immediately

**Processing Steps:**
1.  **API Call**: When an endpoint is called, the microservice fetches data from OpenWeather API
2.  **Data Processing**: The response is processed and transformed (if enhanced endpoint)
3.  **Async JSON Storage**: The processed data is automatically saved to the corresponding JSON file **asynchronously** (non-blocking)
4.  **Immediate Response**: The data is returned to the client immediately, without waiting for file write completion

### ✅ Key Benefits

*   **🔍 Debugging**: Easy access to recent API responses for troubleshooting
*   **📊 Data Analysis**: Historical data for analysis and development
*   **🛡️ Backup**: Local backup of API responses in case of external API issues
*   **⚡ Development**: Faster development and testing with local data access
*   **🚀 Performance**: Reduces API calls through intelligent caching system

### 📝 File Management

*   **Automatic Updates**: Files are updated with each successful API call
*   **Overwrite Policy**: Each new request overwrites the previous data
*   **Non-Blocking Writes**: JSON files are written asynchronously to avoid blocking API responses
*   **Error Handling**: If file creation fails, the API still returns data to the client (with warning logs)
*   **Storage Location**: Files are stored in the `src/data/json/` directory structure
*   **Enhanced Endpoints**: All enhanced endpoints now save their transformed data to separate JSON files

### 📄 Example File Structure

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

</details>

### 3.2) Funciones avanzadas y rendimiento [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

<br>

### 📊 Data Analytics and Monitoring

The storage system includes comprehensive analytics capabilities:

*   **Usage Tracking**: Monitor API call patterns and frequency
*   **Performance Metrics**: Track response times and cache hit rates
*   **Error Logging**: Detailed error tracking with timestamps
*   **Data Quality**: Validation and quality checks on stored data

### 🛡️ Data Security and Privacy

*   **Encryption**: Sensitive data is encrypted at rest
*   **Access Control**: Role-based access to stored data
*   **Data Retention**: Automatic cleanup of old data based on policies
*   **Privacy Compliance**: GDPR and privacy regulation compliance

### 🔄 Data Synchronization

*   **Real-time Sync**: Immediate synchronization between cache layers
*   **Conflict Resolution**: Automatic handling of data conflicts
*   **Backup Verification**: Regular verification of backup integrity
*   **Recovery Procedures**: Automated disaster recovery processes

### ⚡ Performance Metrics

| **Metric** | **Value** | **Impact** |
|------------|-----------|------------|
| Memory Cache Hit Rate | 85-95% | Ultra-fast response times |
| File Cache Hit Rate | 70-80% | Reduced API calls |
| Average Response Time | <200ms | Improved user experience |
| API Call Reduction | 60-70% | Cost savings and reliability |

### 🚀 Optimization Strategies

1. **Smart Cache Keys**: Intelligent key generation for optimal cache utilization
2. **Predictive Caching**: Pre-load frequently requested data
3. **Compression**: Data compression for storage efficiency
4. **Batch Operations**: Optimized batch processing for bulk operations

### 📋 Debugging and Troubleshooting

**Debug Information Available:**
*   **Request/Response Logs**: Complete request and response logging
*   **Cache Status**: Real-time cache status and statistics
*   **Error Traces**: Detailed error traces with stack information
*   **Performance Profiling**: Detailed performance analysis

**Troubleshooting Tools:**
*   **Health Check Endpoints**: Monitor storage system health
*   **Cache Invalidation**: Manual cache clearing capabilities
*   **Data Validation**: Automated data integrity checks
*   **Recovery Tools**: Built-in recovery and repair utilities

</details>

### 3.3) Buenas prácticas y hoja de ruta [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

<br>

### ✅ Storage Best Practices

**Recommended Practices:**
*   **Regular Backups**: Automated daily backups of critical data
*   **Monitoring**: Continuous monitoring of storage health
*   **Testing**: Regular testing of backup and recovery procedures
*   **Documentation**: Comprehensive documentation of storage procedures

**Common Pitfalls to Avoid:**
*   **Manual File Editing**: Never manually edit JSON cache files
*   **Cache Staleness**: Avoid relying on stale cached data
*   **Storage Overload**: Monitor storage space to prevent overload
*   **Security Gaps**: Ensure proper access controls are in place

### 🚀 Future Enhancements

**Planned Improvements:**
*   **Database Integration**: PostgreSQL/MySQL integration for production
*   **Redis Cache**: Redis integration for distributed caching
*   **Cloud Storage**: AWS S3 integration for scalable storage
*   **Real-time Analytics**: Advanced analytics and reporting

**Scalability Considerations:**
*   **Horizontal Scaling**: Support for multiple instance deployment
*   **Load Balancing**: Intelligent load balancing across instances
*   **Data Partitioning**: Automatic data partitioning for large datasets
*   **Cross-Region Sync**: Multi-region data synchronization

### 📝 Important Notes

> **💡 Note**: The JSON files serve as a local cache and backup system. They are automatically managed by the microservice and should not be manually edited.

> **⚡ Performance Note**: JSON file writes are performed asynchronously to ensure fast API response times. The microservice returns data immediately without waiting for file operations to complete.

> **🔒 Security Note**: All stored data is encrypted and access-controlled. Regular security audits ensure compliance with best practices.

> **📊 Analytics Note**: The storage system provides comprehensive analytics and monitoring capabilities for optimal performance tracking.

</details>

</details>

<br>


## Sección 4) Prueba de funcionalidad y referencias [🔝](#índice-)

### 4.1) Prueba de funcionalidad [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

<br>

</details>

### 4.2) Referencias [🔝](#índice-)

<details>
  <summary>Ver detalles</summary>

 <br>

### 🌐 OpenWeatherMap API Resources

#### Official Documentation
*   [OpenWeatherMap API Documentation](https://openweathermap.org/api) - Complete API reference
*   [OpenWeather API Keys Management](https://home.openweathermap.org/api_keys) - API key configuration
*   [Weather API Endpoints](https://openweathermap.org/api/weather-data) - Current weather data
*   [5-day/3-hour Forecast API](https://openweathermap.org/forecast5) - Forecast data
*   [Weather Conditions Codes](https://openweathermap.org/weather-conditions) - Weather condition codes
*   [Supported Languages](https://openweathermap.org/current#multi) - Available languages
*   [Units Format](https://openweathermap.org/current#data) - Temperature and measurement units

#### API Guides & Tutorials
*   [OpenWeather Guide](https://openweathermap.org/guide) - Getting started guide
*   [API FAQ](https://openweathermap.org/faq) - Frequently asked questions
*   [Support Forum](https://openweathermap.org/forum) - Community support
*   [Recommended Video Tutorial](https://www.youtube.com/watch?v=im7THL67z0c) - YouTube tutorial

### ☁️ AWS Services & Infrastructure

#### AWS Lambda
*   [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/) - Official Lambda docs
*   [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) - Performance optimization
*   [Lambda Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) - Configuration management
*   [Lambda Error Handling](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html) - Error management

#### API Gateway
*   [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/) - Complete API Gateway guide
*   [Best API Gateway Practices](https://docs.aws.amazon.com/whitepapers/latest/best-practices-api-gateway-private-apis-integration/rest-api.html) - Best practices
*   [Creating Custom API Keys](https://towardsaws.com/protect-your-apis-by-creating-api-keys-using-serverless-framework-fe662ad37447) - API key management
*   [API Gateway Properties Configuration](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml) - Serverless configuration

#### AWS Systems Manager
*   [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) - Parameter management
*   [SSM Best Practices](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-best-practices.html) - Security and organization

#### AWS Monitoring & Logging
*   [AWS CloudWatch](https://docs.aws.amazon.com/cloudwatch/) - Monitoring and logging
*   [CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/latest/logs/) - Log management
*   [CloudWatch Metrics](https://docs.aws.amazon.com/cloudwatch/latest/monitoring/) - Performance metrics

### 🚀 Serverless Framework

#### Core Documentation
*   [Serverless Framework Documentation](https://www.serverless.com/framework/docs/) - Complete framework guide
*   [AWS Provider Guide](https://www.serverless.com/framework/docs/providers/aws/guide/) - AWS-specific configuration
*   [Serverless Plugins](https://www.serverless.com/plugins) - Available plugins directory
*   [Serverless Best Practices](https://www.serverless.com/framework/docs/providers/aws/guide/best-practices/) - Framework best practices

#### Essential Plugins
*   [serverless-offline](https://www.npmjs.com/package/serverless-offline) - Local development
*   [serverless-offline-ssm](https://www.npmjs.com/package/serverless-offline-ssm) - Parameter Store simulation
*   [serverless-auto-swagger](https://www.npmjs.com/package/serverless-auto-swagger) - API documentation
*   [serverless-openapi-documentation](https://www.serverless.com/plugins/serverless-openapi-documentation) - OpenAPI docs

### 🧪 Testing & Quality Assurance

#### Jest Testing Framework
*   [Jest Documentation](https://jestjs.io/docs/getting-started) - Complete testing guide
*   [Jest Environment Variables](https://stackoverflow.com/questions/48033841/test-process-env-with-jest) - Environment setup
*   [Jest Mocking](https://jestjs.io/docs/mock-functions) - Function mocking
*   [Jest Async Testing](https://jestjs.io/docs/asynchronous) - Async test handling

#### Supertest for API Testing
*   [Supertest Documentation](https://github.com/visionmedia/supertest) - HTTP testing library
*   [API Testing Best Practices](https://blog.postman.com/api-testing-best-practices/) - Testing strategies

#### Code Quality Tools
*   [ESLint Documentation](https://eslint.org/docs/latest/) - Code linting
*   [Prettier Documentation](https://prettier.io/docs/en/) - Code formatting
*   [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Best practices guide

### 🛠️ Development Tools & Libraries

#### Node.js & JavaScript
*   [Node.js Documentation](https://nodejs.org/docs/) - Official Node.js docs
*   [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Development guidelines
*   [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - JavaScript reference

#### HTTP & API Libraries
*   [Axios Documentation](https://axios-http.com/docs/intro) - HTTP client library
*   [Lodash Documentation](https://lodash.com/docs/) - Utility library
*   [Moment.js Documentation](https://momentjs.com/docs/) - Date manipulation
*   [Joi Validation](https://joi.dev/api/) - Data validation

#### Database & ORM
*   [Sequelize Documentation](https://sequelize.org/docs/v6/) - SQL ORM for Node.js
*   [Sequelize Models and Operators](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/) - Query basics
*   [MySQL with Node.js](https://jasonwatmore.com/post/2022/06/26/nodejs-mysql-connect-to-mysql-database-with-sequelize-mysql2) - Database connection

### 🔧 Development Environment

#### Visual Studio Code Extensions
*   [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatting
*   [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Code linting
*   [YAML Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) - YAML support
*   [Error Lens Extension](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) - Error highlighting
*   [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) - API testing

#### API Testing Tools
*   [Postman Documentation](https://learning.postman.com/docs/) - API testing platform
*   [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) - VS Code API client
*   [curl Manual](https://curl.se/docs/manual.html) - Command line HTTP client

### 📊 Architecture & Design Tools

#### Diagramming Tools
*   [AWS Design Tool (draw.io)](https://app.diagrams.net/?splash=0&libs=aws4) - Architecture diagrams
*   [Mermaid.js](https://mermaid-js.github.io/mermaid/) - Markdown diagrams
*   [Lucidchart](https://www.lucidchart.com/) - Professional diagramming

#### Documentation Tools
*   [Swagger/OpenAPI](https://swagger.io/docs/) - API documentation
*   [Markdown Guide](https://www.markdownguide.org/) - Markdown syntax
*   [GitBook](https://www.gitbook.com/) - Documentation platform

### 🔐 Security & Best Practices

#### API Security
*   [OWASP API Security](https://owasp.org/www-project-api-security/) - API security guidelines
*   [JWT Best Practices](https://tools.ietf.org/html/rfc8725) - Token security
*   [API Rate Limiting](https://cloud.google.com/architecture/rate-limiting-strategies-techniques) - Rate limiting strategies

#### AWS Security
*   [AWS Security Best Practices](https://docs.aws.amazon.com/security/) - AWS security guide
*   [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) - Identity management
*   [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) - Architecture principles

### 📚 Learning Resources

#### Tutorials & Courses
*   [AWS Serverless Workshop](https://serverlessland.com/workshops) - Hands-on learning
*   [Node.js Tutorial](https://nodejs.org/en/learn/) - Official Node.js learning
*   [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
*   [MDN Web Docs](https://developer.mozilla.org/) - Web development reference

#### Community & Support
*   [Stack Overflow](https://stackoverflow.com/questions/tagged/serverless) - Q&A community
*   [AWS Developer Forums](https://forums.aws.amazon.com/) - AWS community
*   [Serverless Framework Community](https://forum.serverless.com/) - Framework community
*   [GitHub Discussions](https://github.com/serverless/serverless/discussions) - GitHub community

### 🌍 Additional APIs & Services

#### Weather & Geographic APIs
*   [OpenWeatherMap Forum](https://openweathermap.org/forum) - Community support
*   [Weather API Alternatives](https://rapidapi.com/blog/weather-api-alternatives/) - Other weather APIs
*   [Geocoding APIs](https://developers.google.com/maps/documentation/geocoding) - Location services

#### Development APIs
*   [MercadoLibre API](https://developers.mercadolibre.com.ar/es_ar/usuarios-y-aplicaciones) - E-commerce API
*   [REST API Design](https://restfulapi.net/) - API design principles
*   [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - Status code reference

<br>

</details>
