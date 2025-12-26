/**
 * Weather-related test fixtures
 */

export const weatherFixtures = {
  validCities: ['Paris', 'London', 'Tokyo', 'New York', 'Sydney'],
  invalidCities: ['Xyzabc123', 'NotARealCity', ''],
  ambiguousCities: ['Springfield', 'Portland', 'Richmond'],
};

export const temperatureFixtures = {
  conversions: [
    { celsius: 0, fahrenheit: 32 },
    { celsius: 100, fahrenheit: 212 },
    { celsius: -40, fahrenheit: -40 },
    { celsius: 20, fahrenheit: 68 },
    { celsius: 37, fahrenheit: 98.6 },
  ],
};

export const weatherConditions = {
  rain: {
    main: 'Rain',
    description: 'light rain',
    advice: 'umbrella',
  },
  cold: {
    main: 'Clear',
    description: 'clear sky',
    temp: 5,
    advice: 'coat',
  },
  hot: {
    main: 'Clear',
    description: 'clear sky',
    temp: 35,
    advice: 'stay hydrated',
  },
};
