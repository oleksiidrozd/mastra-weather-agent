/**
 * Mock responses for OpenWeatherMap API
 */

export const mockWeatherSuccess = {
  coord: { lon: 2.3488, lat: 48.8534 },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  base: 'stations',
  main: {
    temp: 20,
    feels_like: 19,
    temp_min: 18,
    temp_max: 22,
    pressure: 1015,
    humidity: 65,
  },
  visibility: 10000,
  wind: { speed: 3.5, deg: 180 },
  clouds: { all: 0 },
  dt: 1703577600,
  sys: {
    type: 2,
    id: 2012208,
    country: 'FR',
    sunrise: 1703574000,
    sunset: 1703605200,
  },
  timezone: 3600,
  id: 2988507,
  name: 'Paris',
  cod: 200,
};

export const mockWeather404 = {
  cod: '404',
  message: 'city not found',
};

export const mockWeather401 = {
  cod: 401,
  message: 'Invalid API key.',
};

export const mockWeather429 = {
  cod: 429,
  message: 'Your account is temporary blocked due to exceeding of requests limitation.',
};

export const mockWeather500 = {
  cod: 500,
  message: 'Internal server error',
};

/**
 * Create a mock fetch function for weather API
 */
export function createMockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
}

/**
 * Create weather data for specific conditions
 */
export function createWeatherData(overrides: {
  city?: string;
  temp?: number;
  conditions?: string;
  humidity?: number;
  description?: string;
} = {}) {
  return {
    ...mockWeatherSuccess,
    name: overrides.city ?? 'Paris',
    main: {
      ...mockWeatherSuccess.main,
      temp: overrides.temp ?? 20,
      humidity: overrides.humidity ?? 65,
    },
    weather: [
      {
        ...mockWeatherSuccess.weather[0],
        main: overrides.conditions ?? 'Clear',
        description: overrides.description ?? 'clear sky',
      },
    ],
  };
}
