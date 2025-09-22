# Weather Endpoints - OpenWeatherMap API Variants

Este documento describe todos los endpoints de weather implementados en el microservicio, cada uno correspondiente a una variante diferente del API de OpenWeatherMap.

## 📋 Índice

1.  [Por Nombre de Ciudad](#1-por-nombre-de-ciudad)
    *   [1.1. Enhanced Weather por Nombre de Ciudad](#11-enhanced-weather-por-nombre-de-ciudad)
2.  [Por Coordenadas](#2-por-coordenadas)
3.  [Por ID de Ciudad](#3-por-id-de-ciudad)
4.  [Por Código Postal](#4-por-código-postal)
5.  [Con Unidades Específicas](#5-con-unidades-específicas)
6.  [Con Idioma Específico](#6-con-idioma-específico)
7.  [Con Parámetros Combinados](#7-con-parámetros-combinados)

***

## 1. Por Nombre de Ciudad

**Endpoint Original** (renombrado para consistencia)

    GET /v1/weather/location/{location}

**Descripción**: Obtiene datos meteorológicos por nombre de ciudad
**Parámetros**:

*   `location`: Nombre de la ciudad (ej: "Buenos Aires", "London")

**Ejemplo**:

```bash
curl http://localhost:4000/v1/weather/location/Buenos%20Aires
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}`

**Controlador**: `get-by-location.js`

### 1.1. Enhanced Weather por Nombre de Ciudad

**Endpoint Enhanced**

    GET /v1/weather-enhanced/location/{location}

**Descripción**: Obtiene datos meteorológicos enriquecidos por nombre de ciudad
**Parámetros**:

*   `location`: Nombre de la ciudad (ej: "Buenos Aires", "London")

**Ejemplo**:

```bash
curl http://localhost:4000/v1/weather-enhanced/location/Buenos%20Aires
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}`

**Controlador**: `get-by-location-enhanced.js`

**Características Adicionales**:

*   Conversiones de temperatura (Kelvin, Celsius, Fahrenheit)
*   Recomendaciones personalizadas
*   Alertas inteligentes
*   Análisis de confort
*   Información del sol

***

## 2. Por Coordenadas

**Nuevo Endpoint**

    GET /v1/weather/coordinates/{lat}/{lon}

**Descripción**: Obtiene datos meteorológicos por coordenadas geográficas
**Parámetros**:

*   `lat`: Latitud (-90 a 90)
*   `lon`: Longitud (-180 a 180)

**Ejemplo**:

```bash
curl http://localhost:4000/v1/weather/coordinates/-34.6132/-58.3772
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}`

**Validaciones**:

*   Latitud debe estar entre -90 y 90
*   Longitud debe estar entre -180 y 180
*   Ambos parámetros deben ser números válidos

***

## 3. Por ID de Ciudad

**Nuevo Endpoint**

    GET /v1/weather/id/{cityId}

**Descripción**: Obtiene datos meteorológicos por ID único de ciudad
**Parámetros**:

*   `cityId`: ID numérico de la ciudad (ej: 3435910 para Buenos Aires)

**Ejemplo**:

```bash
curl http://localhost:4000/v1/weather/id/3435910
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?id={city_id}&appid={API_KEY}`

**Validaciones**:

*   ID debe ser un número positivo
*   ID debe ser un entero válido

***

## 4. Por Código Postal

**Nuevos Endpoints**

    GET /v1/weather/zipcode/{zipcode}/{countryCode}
    GET /v1/weather/zipcode/{zipcode}

**Descripción**: Obtiene datos meteorológicos por código postal
**Parámetros**:

*   `zipcode`: Código postal (ej: "10001")
*   `countryCode`: Código de país (opcional, ej: "us")

**Ejemplos**:

```bash
# Con código de país
curl http://localhost:4000/v1/weather/zipcode/10001/us

# Sin código de país (usa valores por defecto)
curl http://localhost:4000/v1/weather/zipcode/10001
```

**URL OpenWeatherMap**:

*   `https://api.openweathermap.org/data/2.5/weather?zip={zip},{country}&appid={API_KEY}`
*   `https://api.openweathermap.org/data/2.5/weather?zip={zip}&appid={API_KEY}`

***

## 5. Con Unidades Específicas

**Nuevo Endpoint**

    GET /v1/weather/units/{location}/{units}

**Descripción**: Obtiene datos meteorológicos con unidades específicas
**Parámetros**:

*   `location`: Nombre de la ciudad
*   `units`: Tipo de unidades (`metric`, `imperial`, `kelvin`)

**Ejemplos**:

```bash
# Temperatura en Celsius
curl http://localhost:4000/v1/weather/units/London/metric

# Temperatura en Fahrenheit
curl http://localhost:4000/v1/weather/units/New%20York/imperial

# Temperatura en Kelvin (por defecto)
curl http://localhost:4000/v1/weather/units/Tokyo/kelvin

# Enhanced con unidades
curl http://localhost:4000/v1/weather-enhanced/combined/Madrid/metric/es
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={units}&appid={API_KEY}`

**Unidades Disponibles**:

*   `metric`: Celsius, m/s, hPa
*   `imperial`: Fahrenheit, mph, hPa
*   `kelvin`: Kelvin, m/s, hPa (por defecto)

**Notas**
- Si se omiten unidades en endpoints combinados, por defecto se usa Kelvin.
- Respuestas incluyen el payload de OpenWeather sin modificaciones, salvo en los endpoints `enhanced` que agregan métricas y recomendaciones.

***

## 6. Con Idioma Específico

**Nuevo Endpoint**

    GET /v1/weather/language/{location}/{language}

**Descripción**: Obtiene datos meteorológicos con descripciones en idioma específico
**Parámetros**:

*   `location`: Nombre de la ciudad
*   `language`: Código de idioma

**Ejemplos**:

```bash
# Español
curl http://localhost:4000/v1/weather/language/Paris/es

# Francés
curl http://localhost:4000/v1/weather/language/London/fr

# Alemán
curl http://localhost:4000/v1/weather/language/Berlin/de

# Enhanced con idioma y unidades
curl http://localhost:4000/v1/weather-enhanced/combined/Buenos%20Aires/metric/es
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?q={city}&lang={lang}&appid={API_KEY}`

**Idiomas Disponibles**:

*   `en`: Inglés (por defecto)
*   `es`: Español
*   `fr`: Francés
*   `de`: Alemán
*   `it`: Italiano
*   `pt`: Portugués
*   `ru`: Ruso
*   `ja`: Japonés
*   `ko`: Coreano
*   `zh_cn`: Chino Simplificado
*   `zh_tw`: Chino Tradicional
*   `ar`: Árabe
*   `hi`: Hindi
*   `th`: Tailandés
*   `tr`: Turco
*   `vi`: Vietnamita

**Notas**
- Si el idioma no es válido, OpenWeather responde en inglés por defecto.
- Para maximizar aciertos, usar nombres de ciudades en inglés o incluir país: `Santiago, CL`.

***

## 7. Con Parámetros Combinados

**Nuevos Endpoints**

    GET /v1/weather/combined/{location}/{units}/{language}
    GET /v1/weather-enhanced/combined/{location}/{units}/{language}

**Descripción**: Obtiene datos meteorológicos con múltiples parámetros combinados
**Parámetros**:

*   `location`: Nombre de la ciudad (requerido)
*   `units`: Tipo de unidades (opcional, default: kelvin)
*   `language`: Código de idioma (opcional, default: en)

**Ejemplos**:

```bash
# Todos los parámetros
curl http://localhost:4000/v1/weather/combined/Tokyo/metric/es

# Enhanced con todos los parámetros
curl http://localhost:4000/v1/weather-enhanced/combined/Tokyo/metric/es
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={units}&lang={lang}&appid={API_KEY}`

***

## 📊 Comparación de Endpoints

| Endpoint | Parámetros | Caso de Uso | Ejemplo |
|----------|------------|--------------|---------|
| `/v1/weather/location/{location}` | Ciudad | Búsqueda por nombre | Buenos Aires |
| `/v1/weather-enhanced/location/{location}` | Ciudad | Datos enriquecidos | Buenos Aires |
| `/v1/weather/coordinates/{lat}/{lon}` | Coordenadas | Aplicaciones GPS | -34.6132, -58.3772 |
| `/v1/weather/id/{cityId}` | ID | Búsqueda rápida | 3435910 |
| `/v1/weather/zipcode/{zipcode}` | Código postal | Búsqueda local | 10001 |
| `/v1/weather/units/{location}/{units}` | Ciudad + Unidades | Preferencias de usuario | London, metric |
| `/v1/weather/language/{location}/{language}` | Ciudad + Idioma | Internacionalización | Paris, es |
| `/v1/weather/combined/{location}/{units}/{language}` | Todos | Configuración completa | Tokyo, metric, es |
| `/v1/weather-enhanced/combined/{location}/{units}/{language}` | Todos | Configuración completa enriquecida | Tokyo, metric, es |

***

## 🔧 Características Comunes

Todos los endpoints implementados incluyen:

### ✅ Validación de Parámetros

*   Validación de tipos de datos
*   Rangos permitidos para coordenadas
*   Códigos de idioma válidos
*   Unidades válidas

### ✅ Sistema de Caché

*   Caché por 10 minutos
*   Claves únicas por tipo de endpoint
*   Reducción de llamadas a OpenWeatherMap

### ✅ Almacenamiento de Datos

*   Guardado automático en archivos JSON
*   Estructura organizada por tipo de endpoint
*   Persistencia para análisis posterior

### ✅ Manejo de Errores

*   Respuestas HTTP apropiadas
*   Mensajes de error descriptivos
*   Logging detallado

### ✅ Logging

*   Registro de URLs generadas
*   Información de caché utilizada
*   Errores y advertencias

***

## 🚀 Ejemplos de Uso Completo

### Ejemplo 1: Aplicación de GPS

```bash
# Obtener weather por coordenadas del GPS
curl http://localhost:4000/v1/weather/coordinates/40.7128/-74.0060
```

### Ejemplo 2: Aplicación Multilingüe

```bash
# Weather en español para usuarios hispanohablantes
curl http://localhost:4000/v1/weather/language/Madrid/es
```

### Ejemplo 3: Aplicación con Preferencias de Usuario

```bash
# Weather en Celsius para usuario europeo
curl http://localhost:4000/v1/weather/units/Paris/metric
```

### Ejemplo 4: Configuración Completa

```bash
# Weather completo con todas las preferencias
curl http://localhost:4000/v1/weather/combined/Tokyo/metric/es
```

***

## 📝 Notas Importantes

1.  **API Key**: Todos los endpoints requieren una API key válida de OpenWeatherMap
2.  **Rate Limits**: Respetar los límites de la API (1000 calls/day en plan gratuito)
3.  **Activación**: Las nuevas API keys tardan hasta 2 horas en activarse
4.  **Caché**: Los datos se cachean por 10 minutos para optimizar rendimiento
5.  **Almacenamiento**: Los datos se guardan automáticamente en archivos JSON

***

## 🔗 Referencias

*   [OpenWeatherMap API Documentation](https://openweathermap.org/api)
*   [Weather API Endpoints](https://openweathermap.org/api/weather-data)
*   [Supported Languages](https://openweathermap.org/current#multi)
*   [Units Format](https://openweathermap.org/current#data)
