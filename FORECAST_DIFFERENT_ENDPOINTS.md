# Forecast Different Endpoints - Unique Forecast Patterns

Este documento describe los endpoints de forecast que son **verdaderamente diferentes** a los patrones de weather, implementando funcionalidades específicas para pronósticos que no existen en los endpoints de weather.

## 📋 Índice

1. [Por Intervalos de Tiempo](#1-por-intervalos-de-tiempo)
2. [Por Días Específicos](#2-por-días-específicos)
3. [Por Períodos Horarios](#3-por-períodos-horarios)

***

## 1. Por Intervalos de Tiempo

**Endpoint Básico**

    GET /v1/forecast/interval/{location}/{interval}

**Descripción**: Obtiene datos de pronóstico filtrados por intervalos de tiempo específicos
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "London", "Buenos Aires")
* `interval`: Intervalo de tiempo (3h, 6h, 12h, 24h)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast/interval/London/6h
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controlador**: `get-by-interval.js`

**Características Únicas**:
* Filtra datos de pronóstico por intervalos específicos
* Reduce la cantidad de datos devueltos según el intervalo solicitado
* Proporciona análisis de tendencias por intervalo

### 1.1. Enhanced por Intervalos de Tiempo

**Endpoint Enhanced**

    GET /v1/forecast-enhanced/interval/{location}/{interval}

**Descripción**: Obtiene datos de pronóstico enriquecidos por intervalos de tiempo específicos
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "London", "Buenos Aires")
* `interval`: Intervalo de tiempo (3h, 6h, 12h, 24h)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast-enhanced/interval/London/12h
```

**Controlador**: `get-by-interval-enhanced.js`

**Características Adicionales**:
* Análisis de tendencias por intervalo
* Recomendaciones específicas por período
* Resumen estadístico del intervalo
* Conversiones de temperatura y unidades

***

## 2. Por Días Específicos

**Endpoint Básico**

    GET /v1/forecast/days/{location}/{days}

**Descripción**: Obtiene datos de pronóstico para un número específico de días
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "Paris", "Tokyo")
* `days`: Número de días (1-5)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast/days/Paris/3
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controlador**: `get-by-days.js`

**Características Únicas**:
* Filtra pronóstico por número específico de días
* Genera resumen diario con promedios
* Identifica condiciones predominantes por día
* Calcula rangos de temperatura diarios

### 2.1. Enhanced por Días Específicos

**Endpoint Enhanced**

    GET /v1/forecast-enhanced/days/{location}/{days}

**Descripción**: Obtiene datos de pronóstico enriquecidos para días específicos
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "Paris", "Tokyo")
* `days`: Número de días (1-5)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast-enhanced/days/Paris/5
```

**Controlador**: `get-by-days-enhanced.js`

**Características Adicionales**:
* Análisis de variaciones día a día
* Recomendaciones para períodos extendidos
* Tendencias de temperatura a largo plazo
* Planificación de actividades por día

***

## 3. Por Períodos Horarios

**Endpoint Básico**

    GET /v1/forecast/hourly/{location}/{hour}

**Descripción**: Obtiene datos de pronóstico filtrados por períodos horarios específicos
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "Tokyo", "New York")
* `hour`: Período horario (morning, afternoon, evening, night)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast/hourly/Tokyo/morning
```

**URL OpenWeatherMap**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}`

**Controlador**: `get-by-hourly.js`

**Características Únicas**:
* Filtra pronóstico por períodos del día
* Morning: 06:00-11:59
* Afternoon: 12:00-17:59
* Evening: 18:00-21:59
* Night: 22:00-05:59
* Recomendaciones específicas por período

### 3.1. Enhanced por Períodos Horarios

**Endpoint Enhanced**

    GET /v1/forecast-enhanced/hourly/{location}/{hour}

**Descripción**: Obtiene datos de pronóstico enriquecidos por períodos horarios
**Parámetros**:
* `location`: Nombre de la ciudad (ej: "Tokyo", "New York")
* `hour`: Período horario (morning, afternoon, evening, night)

**Ejemplo**:
```bash
curl http://localhost:4000/v1/forecast-enhanced/hourly/Tokyo/afternoon
```

**Controlador**: `get-by-hourly-enhanced.js`

**Características Adicionales**:
* Análisis específico por período del día
* Recomendaciones personalizadas por hora
* Análisis de viento y humedad por período
* Sugerencias de actividades por tiempo del día

***

## 📊 Comparación de Endpoints Diferentes

| Endpoint | Parámetros | Caso de Uso | Ejemplo |
|----------|------------|--------------|---------|
| `/v1/forecast/interval/{location}/{interval}` | Ciudad + Intervalo | Pronóstico por intervalos específicos | London, 6h |
| `/v1/forecast-enhanced/interval/{location}/{interval}` | Ciudad + Intervalo | Pronóstico enriquecido por intervalos | London, 12h |
| `/v1/forecast/days/{location}/{days}` | Ciudad + Días | Pronóstico para días específicos | Paris, 3 |
| `/v1/forecast-enhanced/days/{location}/{days}` | Ciudad + Días | Pronóstico enriquecido por días | Paris, 5 |
| `/v1/forecast/hourly/{location}/{hour}` | Ciudad + Período | Pronóstico por períodos del día | Tokyo, morning |
| `/v1/forecast-enhanced/hourly/{location}/{hour}` | Ciudad + Período | Pronóstico enriquecido por períodos | Tokyo, afternoon |

***

## 🔧 Características Comunes

Todos los endpoints diferentes incluyen:

### ✅ Validación de Parámetros
* Validación de nombres de ciudades
* Validación de intervalos válidos (3h, 6h, 12h, 24h)
* Validación de días (1-5)
* Validación de períodos horarios (morning, afternoon, evening, night)

### 💾 Caché Inteligente
* Caché por 10 minutos para reducir llamadas a la API
* Claves de caché específicas por tipo de endpoint
* Invalidación automática del caché

### 📁 Persistencia de Datos
* Guardado automático en archivos JSON
* Estructura organizada por tipo de endpoint
* Datos de respaldo para análisis

### 🔄 Procesamiento Asíncrono
* Respuesta inmediata al usuario
* Guardado de datos en segundo plano
* Manejo de errores robusto

***

## 🎯 Casos de Uso Específicos

### Intervalos de Tiempo
* **Aplicaciones de planificación**: Para eventos que requieren pronósticos cada 6 o 12 horas
* **Monitoreo industrial**: Para procesos que necesitan datos cada 3 horas
* **Agricultura**: Para riego y cuidado de cultivos cada 24 horas

### Días Específicos
* **Planificación de viajes**: Para conocer el clima de los próximos 3 días
* **Eventos deportivos**: Para preparar actividades al aire libre
* **Construcción**: Para planificar trabajos según el clima esperado

### Períodos Horarios
* **Commuters**: Para saber el clima de la mañana antes de salir
* **Actividades recreativas**: Para planificar actividades según el período del día
* **Comercio**: Para ajustar inventarios según el clima esperado

***

## 🚀 Ejemplos de Respuesta

### Intervalo de 6 horas
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

### 3 días específicos
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

### Período matutino
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

***

## 🔍 Diferencias con Endpoints de Weather

| Aspecto | Weather Endpoints | Forecast Different Endpoints |
|---------|-------------------|------------------------------|
| **Tiempo** | Tiempo actual | Tiempo futuro específico |
| **Filtrado** | Sin filtrado | Filtrado por intervalos/días/períodos |
| **Análisis** | Análisis general | Análisis específico por período |
| **Recomendaciones** | Generales | Específicas por tiempo |
| **Casos de uso** | Información actual | Planificación futura |

Estos endpoints proporcionan funcionalidades únicas que no están disponibles en los endpoints de weather, ofreciendo análisis más específicos y útiles para la planificación y toma de decisiones basadas en pronósticos meteorológicos. 