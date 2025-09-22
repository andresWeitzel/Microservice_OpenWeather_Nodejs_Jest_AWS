# Air Pollution Endpoints - OpenWeather Air Quality API

Esta guía documenta los endpoints de contaminación del aire (air pollution) del microservicio, incluyendo valores válidos, validaciones y ejemplos de uso.

## Índice
- Por ubicación: `/v1/air-pollution/location/{location}` (+ enhanced)
- Por coordenadas: `/v1/air-pollution/coordinates/{lat}/{lon}` (+ enhanced)
- Pronóstico: `/v1/air-pollution/forecast/{location}` (+ enhanced)
- Comparar ciudades: `/v1/air-pollution/compare/{city1}/{city2}` (+ enhanced)

---

## 1) Air Pollution por ubicación
GET `/v1/air-pollution/location/{location}`
GET `/v1/air-pollution-enhanced/location/{location}`

**Parámetros**
- `location`: nombre de ciudad (usar URL-encoding si tiene espacios)

**Ejemplos**
```bash
# Contaminación del aire en Londres
curl "http://localhost:4000/v1/air-pollution/location/London"

# Contaminación del aire en Beijing (enhanced)
curl "http://localhost:4000/v1/air-pollution-enhanced/location/Beijing"

# Contaminación del aire en La Plata
curl "http://localhost:4000/v1/air-pollution/location/La%20Plata"
```

---

## 2) Air Pollution por coordenadas
GET `/v1/air-pollution/coordinates/{lat}/{lon}`
GET `/v1/air-pollution-enhanced/coordinates/{lat}/{lon}`

**Parámetros**
- `lat`: latitud (-90 a 90)
- `lon`: longitud (-180 a 180)

**Ejemplos**
```bash
# Coordenadas de Londres
curl "http://localhost:4000/v1/air-pollution/coordinates/51.5074/-0.1278"

# Coordenadas de Buenos Aires (enhanced)
curl "http://localhost:4000/v1/air-pollution-enhanced/coordinates/-34.6118/-58.3960"

# Coordenadas de La Plata
curl "http://localhost:4000/v1/air-pollution/coordinates/-34.9214/-57.9544"
```

---

## 3) Air Pollution Forecast (Pronóstico)
GET `/v1/air-pollution/forecast/{location}`
GET `/v1/air-pollution-enhanced/forecast/{location}`

**Parámetros**
- `location`: nombre de ciudad

**Ejemplos**
```bash
# Pronóstico de contaminación en Delhi
curl "http://localhost:4000/v1/air-pollution/forecast/Delhi"

# Pronóstico de contaminación en París (enhanced)
curl "http://localhost:4000/v1/air-pollution-enhanced/forecast/Paris"

# Pronóstico de contaminación en Madrid
curl "http://localhost:4000/v1/air-pollution/forecast/Madrid"
```

---

## 4) Comparar ciudades
GET `/v1/air-pollution/compare/{city1}/{city2}`
GET `/v1/air-pollution-enhanced/compare/{city1}/{city2}`

**Parámetros**
- `city1`: nombre de la primera ciudad
- `city2`: nombre de la segunda ciudad

**Ejemplos**
```bash
# Comparar Londres vs Beijing
curl "http://localhost:4000/v1/air-pollution/compare/London/Beijing"

# Comparar Delhi vs París (enhanced)
curl "http://localhost:4000/v1/air-pollution-enhanced/compare/Delhi/Paris"

# Comparar La Plata vs Buenos Aires
curl "http://localhost:4000/v1/air-pollution/compare/La%20Plata/Buenos%20Aires"
```

---

## Notas generales

**Fuente**: OpenWeather Air Pollution API
- Current: `data/2.5/air_pollution`
- Forecast: `data/2.5/air_pollution/forecast`

**URL-encoding**: encodear espacios/acentos, por ejemplo `La%20Plata`.

**Errores**: si no se encuentran coordenadas o datos, se devuelve 400 con detalle.

**Enhanced**: agrega análisis de salud, recomendaciones, alertas y metadatos enriquecidos.

**Cache**: todos los endpoints incluyen cache para mejorar performance.

---

## Estructura de respuesta

### Endpoint básico
```json
{
  "coord": { "lon": -0.1278, "lat": 51.5074 },
  "list": [
    {
      "main": { "aqi": 2 },
      "components": {
        "co": 205.31,
        "no": 0.18,
        "no2": 11.24,
        "o3": 68.4,
        "so2": 2.62,
        "pm2_5": 4.17,
        "pm10": 6.67,
        "nh3": 0.6
      },
      "dt": 1606483200
    }
  ],
  "location": {
    "city": "London",
    "country": "GB",
    "coordinates": { "lat": 51.5074, "lon": -0.1278 }
  }
}
```

### Endpoint enhanced
```json
{
  "current": {
    "aqi": 2,
    "level": "Fair",
    "components": { ... },
    "healthImpact": {
      "respiratoryRisk": "Low",
      "cardiovascularRisk": "Low",
      "overallRisk": "Low"
    }
  },
  "recommendations": {
    "outdoor": ["Good conditions for outdoor activities"],
    "health": ["No special precautions needed"],
    "sensitive": ["Suitable for sensitive individuals"]
  },
  "alerts": [],
  "metadata": { ... }
}
```

---

## Códigos de calidad del aire (AQI)

| AQI | Nivel | Descripción |
|-----|-------|-------------|
| 1 | Good | Buena calidad del aire |
| 2 | Fair | Calidad del aire aceptable |
| 3 | Moderate | Calidad del aire moderada |
| 4 | Poor | Calidad del aire pobre |
| 5 | Very Poor | Calidad del aire muy pobre |

---

## Componentes medidos

- **PM2.5**: Partículas finas (≤2.5 μm)
- **PM10**: Partículas gruesas (≤10 μm)
- **NO2**: Dióxido de nitrógeno
- **O3**: Ozono
- **SO2**: Dióxido de azufre
- **CO**: Monóxido de carbono
- **NH3**: Amoníaco

---

## Ejemplos de uso práctico

### Monitoreo de salud
```bash
# Verificar calidad del aire antes de salir
curl "http://localhost:4000/v1/air-pollution-enhanced/location/Beijing"
```

### Planificación de viajes
```bash
# Comparar calidad del aire entre destinos
curl "http://localhost:4000/v1/air-pollution-enhanced/compare/Delhi/Paris"
```

### Pronóstico para actividades
```bash
# Ver pronóstico de contaminación para planificar actividades
curl "http://localhost:4000/v1/air-pollution-enhanced/forecast/Madrid"
```

### Monitoreo por coordenadas
```bash
# Verificar calidad del aire en ubicación específica
curl "http://localhost:4000/v1/air-pollution/coordinates/40.4168/-3.7038"
```
