/**
 * Memory/preferences test fixtures
 */

export const memoryFixtures = {
  validPreferences: {
    default_city: 'London',
    preferred_units: 'celsius' as const,
    user_name: 'Oleksii',
  },

  emptyPreferences: {
    default_city: undefined,
    preferred_units: 'celsius' as const,
    user_name: undefined,
  },

  fahrenheitPreferences: {
    default_city: 'New York',
    preferred_units: 'fahrenheit' as const,
    user_name: 'Alex',
  },
};

export const intentFixtures = {
  preferenceUpdates: [
    'Set my default city to Paris',
    'I prefer Fahrenheit',
    'My name is Alex',
    'Remember that I live in Tokyo',
    'Use Celsius for temperatures',
  ],

  weatherQueries: [
    "What's the weather in London?",
    "What's the weather?",
    'Is it raining in Tokyo?',
    'How hot is it in Paris?',
    'Weather forecast for New York',
  ],

  conversions: [
    'Convert 32F to Celsius',
    "What's that in Fahrenheit?",
    'What is 25C in F?',
  ],

  offTopic: [
    'Tell me about Bitcoin',
    "What's the stock market doing?",
    'Who won the game last night?',
  ],

  gibberish: ['asdfghjkl', '123456', '!@#$%^', 'fkdjsla'],
};
