# Forecast Endpoints - OpenWeather 5-day/3h

Esta guía documenta los endpoints de pronóstico (forecast) del microservicio, incluyendo valores válidos, validaciones y ejemplos de uso.

## Índice

*   Por intervalo de horas: `/v1/forecast/interval/{location}/{interval}` (+ enhanced)
*   Por cantidad de días: `/v1/forecast/days/{location}/{days}` (+ enhanced)
*   Por franja horaria: `/v1/forecast/hourly/{location}/{hour}` (+ enhanced)
*   Por eventos: `/v1/forecast/events/{location}/{eventType}` (+ enhanced)
*   Comparar periodos: `/v1/forecast/compare/{location}/{period1}/{period2}` (+ enhanced)
*   Semanas: `/v1/forecast/weekly/{location}/{weeks}` (+ enhanced)

***

## 1) Forecast por intervalo de horas

GET `/v1/forecast/interval/{location}/{interval}`
GET `/v1/forecast-enhanced/interval/{location}/{interval}`

*   Parámetros
    *   `location`: nombre de ciudad (usar URL-encoding si tiene espacios)
    *   `interval`: uno de `3h`, `6h`, `12h`, `24h`

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/interval/La%20Plata/6h"
curl "http://localhost:4000/v1/forecast-enhanced/interval/London/12h"
```

***

## 2) Forecast por cantidad de días

GET `/v1/forecast/days/{location}/{days}`
GET `/v1/forecast-enhanced/days/{location}/{days}`

*   Parámetros
    *   `location`: nombre de ciudad
    *   `days`: número entre 1 y 5

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/days/Buenos%20Aires/3"
curl "http://localhost:4000/v1/forecast-enhanced/days/Paris/5"
```

***

## 3) Forecast por franja horaria

GET `/v1/forecast/hourly/{location}/{hour}`
GET `/v1/forecast-enhanced/hourly/{location}/{hour}`

*   Parámetros
    *   `location`: nombre de ciudad
    *   `hour`: uno de `morning`, `afternoon`, `evening`, `night`

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/hourly/La%20Plata/afternoon"
curl "http://localhost:4000/v1/forecast-enhanced/hourly/Buenos%20Aires/night"
```

***

## 4) Forecast por eventos

GET `/v1/forecast/events/{location}/{eventType}`
GET `/v1/forecast-enhanced/events/{location}/{eventType}`

*   Parámetros
    *   `location`: nombre de ciudad
    *   `eventType`: uno de `weekend`, `holiday`, `workday`, `vacation`, `party`, `sports`

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/events/La%20Plata/weekend"
curl "http://localhost:4000/v1/forecast-enhanced/events/London/vacation"
```

***

## 5) Comparar periodos

GET `/v1/forecast/compare/{location}/{period1}/{period2}`
GET `/v1/forecast-enhanced/compare/{location}/{period1}/{period2}`

*   Parámetros
    *   `location`: nombre de ciudad
    *   `period1`, `period2`: uno de `today`, `tomorrow`, `weekend`, `next_week`, `morning`, `afternoon`, `evening`, `night`

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/compare/London/today/tomorrow"
curl "http://localhost:4000/v1/forecast-enhanced/compare/Buenos%20Aires/afternoon/night"
```

***

## 6) Semanas

GET `/v1/forecast/weekly/{location}/{weeks}`
GET `/v1/forecast-enhanced/weekly/{location}/{weeks}`

*   Parámetros
    *   `location`: nombre de ciudad
    *   `weeks`: número entre 1 y 4 (nota: el API base provee hasta 5 días; el endpoint agrupa por ventanas semanales sobre esos datos)

*   Ejemplos

```bash
curl "http://localhost:4000/v1/forecast/weekly/Paris/2"
curl "http://localhost:4000/v1/forecast-enhanced/weekly/Madrid/1"
```

***

## Notas generales

*   Fuente: OpenWeather `data/2.5/forecast` (5 días, intervalos de 3h).
*   Unidades: por defecto Kelvin; varios endpoints usan `metric`. Donde aplique, el código ya fija `units=metric`.
*   URL-encoding: encodear espacios/acentos, por ejemplo `La%20Plata`.
*   Errores: si no hay datos para el rango/periodo solicitado, se devuelve 400 con detalle.
*   Enhanced: agrega resúmenes, tendencias, recomendaciones y metadatos.
