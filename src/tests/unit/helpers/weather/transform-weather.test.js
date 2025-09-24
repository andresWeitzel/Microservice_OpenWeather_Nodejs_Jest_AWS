"use strict";

//Helpers
const { transformWeatherData } = require("../../../../helpers/weather/transform-weather");

//Mock data
const mockWeatherData = {
  coord: { lon: -0.13, lat: 51.51 },
  weather: [
    {
      id: 300,
      main: "Drizzle",
      description: "light intensity drizzle",
      icon: "09d"
    }
  ],
  base: "stations",
  main: {
    temp: 280.32,
    feels_like: 278.15,
    temp_min: 279.15,
    temp_max: 281.15,
    pressure: 1012,
    humidity: 81,
    sea_level: 1012,
    grnd_level: 1009
  },
  visibility: 10000,
  wind: {
    speed: 4.1,
    deg: 80,
    gust: 6.57
  },
  clouds: { all: 90 },
  dt: 1485789600,
  sys: {
    type: 1,
    id: 5091,
    message: 0.0103,
    country: "GB",
    sunrise: 1485762037,
    sunset: 1485794875
  },
  timezone: 0,
  id: 2643743,
  name: "London",
  cod: 200
};

describe("- transformWeatherData helper (Unit Test)", () => {
  describe("1) Check cases for arguments.", () => {
    it("Should return an enriched weather object when valid data is passed", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("location");
      expect(result).toHaveProperty("temperature");
      expect(result).toHaveProperty("weather");
      expect(result).toHaveProperty("atmosphere");
      expect(result).toHaveProperty("wind");
      expect(result).toHaveProperty("sun");
      expect(result).toHaveProperty("alerts");
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("comfort");
    });

    it("Should return correct temperature conversions", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.temperature.kelvin).toBe(280.32);
      expect(result.temperature.celsius).toBe(7.17);
      expect(result.temperature.fahrenheit).toBe(44.91);
    });

    it("Should return correct location information", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.location.city).toBe("London");
      expect(result.location.country).toBe("GB");
      expect(result.location.coordinates).toEqual({ lon: -0.13, lat: 51.51 });
    });

    it("Should return correct weather information", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.weather.condition).toBe("Drizzle");
      expect(result.weather.description).toBe("light intensity drizzle");
      expect(result.weather.severity).toBe("light");
      expect(result.weather.recommendation).toBe("Bring an umbrella or raincoat");
    });

    it("Should return correct wind description", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.wind.speed).toBe(4.1);
      expect(result.wind.direction).toBe(80);
      expect(result.wind.description).toBe("Gentle breeze");
    });

    it("Should return correct atmosphere data", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.atmosphere.pressure).toBe(1012);
      expect(result.atmosphere.humidity).toBe(81);
      expect(result.atmosphere.visibility).toBe(10000);
      expect(result.atmosphere.clouds).toBe(90);
    });

    it("Should return correct sun information", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.sun.sunrise).toBeDefined();
      expect(result.sun.sunset).toBeDefined();
      expect(result.sun.dayLength).toBeDefined();
    });

    it("Should return alerts array", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(Array.isArray(result.alerts)).toBe(true);
    });

    it("Should return recommendations object", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.recommendations).toHaveProperty("clothing");
      expect(result.recommendations).toHaveProperty("activities");
      expect(result.recommendations).toHaveProperty("transport");
      expect(result.recommendations).toHaveProperty("health");
    });

    it("Should return comfort information", async () => {
      const result = await transformWeatherData(mockWeatherData);
      
      expect(result.comfort).toHaveProperty("index");
      expect(result.comfort).toHaveProperty("level");
      expect(typeof result.comfort.index).toBe("number");
      expect(typeof result.comfort.level).toBe("string");
    });

    it("Should throw error for invalid weather data", async () => {
      await expect(transformWeatherData(null)).rejects.toThrow("Weather data is null or undefined");
      await expect(transformWeatherData({})).rejects.toThrow("Invalid weather data");
      await expect(transformWeatherData({ weather: [] })).rejects.toThrow("Invalid weather data");
    });

    it("Should handle missing optional properties gracefully", async () => {
      const minimalData = {
        main: { temp: 280.32, feels_like: 278.15, pressure: 1012, humidity: 81 },
        weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
        name: "London",
        sys: { country: "GB" }
      };
      
      const result = await transformWeatherData(minimalData);
      
      expect(result.location.city).toBe("London");
      expect(result.location.country).toBe("GB");
      expect(result.temperature.celsius).toBe(7.17);
    });
  });

  describe("2) Check temperature conversion accuracy", () => {
    it("Should convert 0 Kelvin to -273.15 Celsius", async () => {
      const zeroKelvinData = {
        ...mockWeatherData,
        main: { ...mockWeatherData.main, temp: 0, feels_like: 0 }
      };
      
      const result = await transformWeatherData(zeroKelvinData);
      
      expect(result.temperature.celsius).toBe(-273.15);
      expect(result.temperature.fahrenheit).toBe(-459.67);
    });

    it("Should convert 273.15 Kelvin to 0 Celsius", async () => {
      const freezingData = {
        ...mockWeatherData,
        main: { ...mockWeatherData.main, temp: 273.15, feels_like: 273.15 }
      };
      
      const result = await transformWeatherData(freezingData);
      
      expect(result.temperature.celsius).toBe(0);
      expect(result.temperature.fahrenheit).toBe(32);
    });
  });

  describe("3) Check weather severity classification", () => {
    it("Should classify thunderstorm correctly", async () => {
      const thunderstormData = {
        ...mockWeatherData,
        weather: [{ id: 200, main: "Thunderstorm", description: "thunderstorm with light rain", icon: "11d" }]
      };
      
      const result = await transformWeatherData(thunderstormData);
      
      expect(result.weather.severity).toBe("light");
    });

    it("Should classify heavy rain correctly", async () => {
      const heavyRainData = {
        ...mockWeatherData,
        weather: [{ id: 502, main: "Rain", description: "heavy intensity rain", icon: "10d" }]
      };
      
      const result = await transformWeatherData(heavyRainData);
      
      expect(result.weather.severity).toBe("light");
    });
  });

  describe("4) Check comfort index calculation", () => {
    it("Should calculate comfort index for comfortable temperature", async () => {
      const comfortableData = {
        ...mockWeatherData,
        main: { ...mockWeatherData.main, temp: 293.15, humidity: 50 }, // 20°C, 50% humidity
        wind: { speed: 2 }
      };
      
      const result = await transformWeatherData(comfortableData);
      
      expect(result.comfort.index).toBeGreaterThan(7);
      expect(result.comfort.level).toBe("comfortable");
    });

    it("Should calculate comfort index for extreme cold", async () => {
      const coldData = {
        ...mockWeatherData,
        main: { ...mockWeatherData.main, temp: 263.15, humidity: 80 }, // -10°C, 80% humidity
        wind: { speed: 5 }
      };
      
      const result = await transformWeatherData(coldData);
      
      expect(result.comfort.index).toBeLessThan(5);
      expect(result.comfort.level).toBe("very_cold");
    });
  });
}); 