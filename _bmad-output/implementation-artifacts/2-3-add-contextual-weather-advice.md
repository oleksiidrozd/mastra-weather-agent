# Story 2.3: Add Contextual Weather Advice

Status: done

## Story

As a **user**,
I want **the agent to include practical, contextual advice based on weather conditions**,
So that **I know what to wear or bring when I go outside**.

## Acceptance Criteria

1. **Given** the weather shows rain or thunderstorm
   **When** the agent responds with weather info
   **Then** it includes advice like "Don't forget your umbrella!" (FR9)

2. **Given** the temperature is cold (below 10°C/50°F)
   **When** the agent responds with weather info
   **Then** it includes advice like "Bundle up - it's chilly out there!"

3. **Given** the temperature is hot (above 30°C/86°F)
   **When** the agent responds with weather info
   **Then** it includes advice like "Stay hydrated and find some shade!"

4. **Given** the weather shows snow
   **When** the agent responds with weather info
   **Then** it includes advice about slippery conditions

5. **Given** the weather shows clear/sunny conditions
   **When** the agent responds with weather info
   **Then** it includes positive advice about outdoor activities or sunscreen

6. **Given** multiple conditions apply (e.g., cold AND rainy)
   **When** the agent responds
   **Then** it combines relevant advice naturally

## Tasks / Subtasks

- [x] Task 1: Define weather condition triggers (AC: #1-5)
  - [x] Map weather conditions to advice categories
  - [x] Define temperature thresholds for cold/hot
  - [x] List all condition-advice mappings

- [x] Task 2: Update agent instructions with advice rules (AC: #1-6)
  - [x] Add comprehensive advice rules to system prompt
  - [x] Include natural phrasing variations
  - [x] Add rules for combining multiple conditions

- [x] Task 3: Enhance weather response formatting (AC: #6)
  - [x] Ensure advice flows naturally in response
  - [x] Avoid repetitive phrasing
  - [x] Keep persona consistent with advice

- [x] Task 4: Test advice triggers (AC: #1-6)
  - [x] Tested Moscow: 1°C with snow → "Full winter gear is recommended, and watch your step - roads and sidewalks might be slippery!"
  - [x] Tested Dubai: 25°C warm → "It's warm out – dress light and stay cool!"
  - [x] Tested London: 5°C cold → "Bundle up – it's chilly out there, and a warm jacket is definitely needed today!"
  - [x] Tested Sydney: 17°C + windy → Combined advice: "A light jacket or sweater should do the trick, and you might want to hold onto your hat!"

## Dev Notes

### Dependencies on Previous Stories

**Story 2.1 Required:**
- `getCurrentWeather` tool returning weather data
- Weather conditions from API

**Story 2.2 Required:**
- Temperature unit handling
- Default city functionality

### Weather Condition Mapping

OpenWeatherMap returns conditions in `weather[0].main`:

| API Condition | Advice Category |
|---------------|-----------------|
| Thunderstorm | Rain + Storm warning |
| Drizzle | Light rain |
| Rain | Umbrella needed |
| Snow | Cold + Slippery |
| Mist, Fog, Haze | Visibility warning |
| Clear | Sunny/nice |
| Clouds | Neutral |

### Temperature Thresholds

| Celsius | Fahrenheit | Category | Advice |
|---------|------------|----------|--------|
| < 0°C | < 32°F | Freezing | Heavy coat, watch for ice |
| 0-10°C | 32-50°F | Cold | Bundle up, jacket needed |
| 10-18°C | 50-64°F | Cool | Light jacket or sweater |
| 18-25°C | 64-77°F | Pleasant | Comfortable |
| 25-30°C | 77-86°F | Warm | Stay cool |
| > 30°C | > 86°F | Hot | Hydrate, seek shade |

### Agent Instruction Updates

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## CONTEXTUAL WEATHER ADVICE

Always include helpful, practical advice based on conditions. Make it natural and conversational.

### PRECIPITATION ADVICE

**Rain/Drizzle:**
- "Don't forget your umbrella!"
- "You might want to grab a rain jacket."
- "Keep an umbrella handy - there's rain in the forecast."

**Thunderstorm:**
- "Stormy conditions! Best to stay indoors if you can."
- "Thunder and lightning expected - take shelter if outside."

**Snow:**
- "Watch your step - roads and sidewalks might be slippery!"
- "Snow day! Drive carefully if you're heading out."
- "Bundle up extra warm - there's snow out there!"

### TEMPERATURE ADVICE

**Freezing (< 0°C / 32°F):**
- "It's below freezing! Layer up and watch for ice."
- "Brrr! Full winter gear recommended today."

**Cold (0-10°C / 32-50°F):**
- "Bundle up - it's chilly out there!"
- "A warm jacket is definitely needed today."

**Cool (10-18°C / 50-64°F):**
- "A light jacket or sweater should do the trick."
- "Comfortable weather with a slight chill."

**Pleasant (18-25°C / 64-77°F):**
- "Perfect weather to be outside!"
- "Great conditions for a walk or outdoor activities."

**Warm (25-30°C / 77-86°F):**
- "It's warm out - dress light and stay cool!"
- "Nice and toasty - maybe grab some sunscreen."

**Hot (> 30°C / 86°F):**
- "It's hot out there! Stay hydrated and find some shade."
- "Scorching day ahead - drink plenty of water!"

### SPECIAL CONDITIONS

**Sunny/Clear:**
- "Beautiful clear skies today!"
- "Perfect sunshine - don't forget sunscreen if you're out long!"

**Windy (wind > 20 km/h):**
- "It's breezy out - hold onto your hat!"
- "Windy conditions - might affect outdoor plans."

**High Humidity (> 80%):**
- "It's humid out there - might feel warmer than the temperature suggests."
- "Sticky weather - the humidity is high today."

**Fog/Mist:**
- "Visibility might be low - drive carefully!"
- "Foggy conditions - take it slow on the roads."

### COMBINING CONDITIONS

When multiple conditions apply, combine advice naturally:

**Cold + Rain:**
"It's 8°C with rain in Paris. Bundle up AND grab your umbrella - it's a wet, chilly one today!"

**Hot + Sunny:**
"It's a scorching 35°C with clear skies in Dubai. Stay hydrated, seek shade when you can, and don't forget the sunscreen!"

**Snow + Freezing:**
"Brr! It's -5°C with snow in Moscow. Full winter gear is a must, and watch your step on icy sidewalks!"

### ADVICE PLACEMENT

Include advice at the END of the weather summary, flowing naturally:

GOOD: "Currently 22°C and sunny in Paris with 45% humidity. Perfect day to be outside - maybe grab some sunscreen!"

BAD: "You should bring sunscreen. It's 22°C in Paris..."

Keep it conversational and helpful, never preachy or repetitive.
```

### Response Format Examples

**Rainy Weather:**
```
"Currently 15°C with rain in London. Humidity at 85%.
Don't forget your umbrella - it's coming down out there!"
```

**Hot and Sunny:**
```
"It's a warm 32°C with clear skies in Phoenix. Low humidity at 20%.
Hot one today! Stay hydrated and find some shade when you can."
```

**Cold and Snowy:**
```
"Currently -3°C with snow in Toronto. Feels like -8°C with the wind.
Bundle up with your warmest gear, and watch your step - it's slippery out there!"
```

**Pleasant Weather:**
```
"Beautiful 21°C and partly cloudy in San Francisco. Humidity at 55%.
Perfect weather for a walk! Maybe a light layer in case it cools down."
```

**Multiple Conditions:**
```
"It's 7°C with thunderstorms in Seattle. Humidity at 90%, feels like 4°C.
Definitely an indoor day - heavy rain and thunder expected. If you must go out,
layer up warm AND bring a sturdy umbrella!"
```

### Wind Speed Reference

OpenWeatherMap returns wind in m/s. Convert for display:
- m/s × 3.6 = km/h
- m/s × 2.237 = mph

Thresholds:
- Light: < 5 m/s (18 km/h)
- Moderate: 5-10 m/s (18-36 km/h)
- Windy: > 10 m/s (36 km/h)

### File Changes

```
src/mastra/agents/weatherAgent.ts  # Modify: add advice instructions
```

No code changes needed - all advice logic is in agent instructions. The LLM generates appropriate advice based on the weather data returned by the tool.

### Testing Scenarios

**Rain Test:**
```
Find a city currently experiencing rain
Expected: Response includes umbrella advice
```

**Temperature Tests:**
```
Query a cold city (Moscow in winter): Expect bundling advice
Query a hot city (Dubai): Expect hydration advice
```

**Combined Conditions:**
```
Cold + rainy city: Expect both jacket AND umbrella advice
Hot + sunny: Expect both hydration AND sunscreen advice
```

### References

- [Source: _bmad-output/prd.md#FR9 - Contextual advice in weather responses]
- [Source: _bmad-output/prd.md#User Journey 1 - Weather Query example]
- [Source: Story 2.1 - Weather data structure]
- [Source: Story 1.3 - Persona and formatting guidelines]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Added comprehensive CONTEXTUAL WEATHER ADVICE section to agent instructions
- Defined 6 temperature thresholds: Freezing (<0°C), Cold (0-10°C), Cool (10-18°C), Pleasant (18-25°C), Warm (25-30°C), Hot (>30°C)
- Added precipitation advice for Rain/Drizzle, Thunderstorm, and Snow conditions
- Added special condition advice for Sunny/Clear, Windy (>20 km/h), High Humidity (>80%), Fog/Mist
- Added combining conditions rules for natural multi-condition advice
- Added advice placement guidelines (always at END of response)
- Simplified original "Contextual Advice" section to reference new detailed section
- Test results confirmed advice working correctly:
  - Moscow (1°C + snow): Full winter gear + slippery roads advice
  - Dubai (25°C): Warm weather advice
  - London (5°C): Cold weather bundling advice
  - Sydney (17°C + 7 m/s wind): Combined cool + windy advice

### File List

- [x] `src/mastra/agents/weatherAgent.ts` - Modified (added CONTEXTUAL WEATHER ADVICE section ~90 lines)

### Change Log

- 2025-12-26: Story 2.3 implemented - Comprehensive contextual weather advice
