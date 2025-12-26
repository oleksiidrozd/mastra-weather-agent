# Story 2.1: Implement getCurrentWeather Tool

Status: ready-for-dev

## Story

As a **developer**,
I want **a shared OpenWeatherMap API client and getCurrentWeather tool**,
So that **the agent can retrieve and display real-time weather information**.

## Acceptance Criteria

1. **Given** the `OPENWEATHERMAP_API_KEY` environment variable is set
   **When** I call the weather API client with a valid city
   **Then** it returns weather data with temperature, conditions, and humidity
   **And** the API call completes within 5 seconds (NFR2)

2. **Given** an invalid city name is provided
   **When** I call the weather API client
   **Then** it returns `{ success: false, errorCode: "CITY_NOT_FOUND" }`

3. **Given** the API key is invalid
   **When** I call the weather API client
   **Then** it returns `{ success: false, errorCode: "API_KEY_INVALID" }`

4. **Given** the API is unavailable or returns 5xx
   **When** I call the weather API client
   **Then** it returns `{ success: false, errorCode: "API_UNAVAILABLE" }` (NFR9)

5. **Given** the API rate limit is exceeded
   **When** I call the weather API client
   **Then** it returns `{ success: false, errorCode: "RATE_LIMITED" }` (NFR8)

6. **Given** the agent is running
   **When** I ask "What's the weather in Paris?"
   **Then** the agent calls `getCurrentWeather` tool with city="Paris"
   **And** returns formatted weather with temperature, conditions, and humidity

## Tasks / Subtasks

- [ ] Task 1: Create weather API client (AC: #1-5)
  - [ ] Create `src/mastra/lib/weatherApi.ts`
  - [ ] Implement `fetchWeather(city: string)` function
  - [ ] Add proper error handling for all HTTP status codes
  - [ ] Map API errors to error codes from `errorCodes.ts`

- [ ] Task 2: Define weather data types (AC: #1)
  - [ ] Add weather response types to `src/mastra/lib/types.ts`
  - [ ] Define `WeatherData` interface
  - [ ] Define `WeatherApiResponse` success/error union type

- [ ] Task 3: Create getCurrentWeather tool (AC: #6)
  - [ ] Create `src/mastra/tools/getCurrentWeather.ts`
  - [ ] Define Zod input schema (city: string)
  - [ ] Define Zod output schema (success/error union)
  - [ ] Implement execute function calling weatherApi

- [ ] Task 4: Create tools barrel export (AC: #6)
  - [ ] Create `src/mastra/tools/index.ts`
  - [ ] Export getCurrentWeather tool

- [ ] Task 5: Register tool with agent (AC: #6)
  - [ ] Update `src/mastra/agents/weatherAgent.ts` to include tool
  - [ ] Add tool to agent's tools array

- [ ] Task 6: Test the tool (AC: #1-6)
  - [ ] Run CLI and ask about weather in a valid city
  - [ ] Test with invalid city name
  - [ ] Verify error handling works

## Dev Notes

### Previous Story Context

**From Story 1.1:**
- Error codes defined in `src/mastra/lib/errorCodes.ts`:
  ```typescript
  export const ErrorCodes = {
    CITY_NOT_FOUND: 'CITY_NOT_FOUND',
    API_KEY_INVALID: 'API_KEY_INVALID',
    API_UNAVAILABLE: 'API_UNAVAILABLE',
    RATE_LIMITED: 'RATE_LIMITED',
  } as const
  ```

**From Story 1.2 (expected):**
- Agent created at `src/mastra/agents/weatherAgent.ts`
- CLI working at `src/cli/index.ts`

### Weather API Client Implementation

**File: `src/mastra/lib/weatherApi.ts`**

```typescript
import { ErrorCodes, type ErrorCode } from './errorCodes.js'

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

export interface WeatherData {
  city: string
  country: string
  temperature: number  // Celsius
  feelsLike: number
  humidity: number
  conditions: string
  description: string
  windSpeed: number
  icon: string
}

export type WeatherApiResult =
  | { success: true; data: WeatherData }
  | { success: false; errorCode: ErrorCode }

export async function fetchWeather(city: string): Promise<WeatherApiResult> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return { success: false, errorCode: ErrorCodes.API_KEY_INVALID }
  }

  const url = new URL(API_BASE_URL)
  url.searchParams.set('q', city)
  url.searchParams.set('appid', apiKey)
  url.searchParams.set('units', 'metric') // Always fetch in Celsius, convert later if needed

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout (NFR2)

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Map HTTP status codes to error codes
      switch (response.status) {
        case 401:
          return { success: false, errorCode: ErrorCodes.API_KEY_INVALID }
        case 404:
          return { success: false, errorCode: ErrorCodes.CITY_NOT_FOUND }
        case 429:
          return { success: false, errorCode: ErrorCodes.RATE_LIMITED }
        default:
          return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
      }
    }

    const data = await response.json()

    return {
      success: true,
      data: {
        city: data.name,
        country: data.sys?.country ?? '',
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        conditions: data.weather[0]?.main ?? 'Unknown',
        description: data.weather[0]?.description ?? '',
        windSpeed: Math.round(data.wind?.speed ?? 0),
        icon: data.weather[0]?.icon ?? '',
      },
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
    }
    return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
  }
}
```

### getCurrentWeather Tool Implementation

**File: `src/mastra/tools/getCurrentWeather.ts`**

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { fetchWeather } from '../lib/weatherApi.js'
import { ErrorCodes } from '../lib/errorCodes.js'

export const getCurrentWeather = createTool({
  id: 'getCurrentWeather',
  description: 'Get the current weather for a specified city. Returns temperature, conditions, humidity, and more.',
  inputSchema: z.object({
    city: z.string().describe('The city name to get weather for (e.g., "Paris", "Tokyo", "New York")'),
  }),
  outputSchema: z.union([
    z.object({
      success: z.literal(true),
      data: z.object({
        city: z.string(),
        country: z.string(),
        temperature: z.number(),
        feelsLike: z.number(),
        humidity: z.number(),
        conditions: z.string(),
        description: z.string(),
        windSpeed: z.number(),
      }),
    }),
    z.object({
      success: z.literal(false),
      errorCode: z.enum([
        ErrorCodes.CITY_NOT_FOUND,
        ErrorCodes.API_KEY_INVALID,
        ErrorCodes.API_UNAVAILABLE,
        ErrorCodes.RATE_LIMITED,
      ]),
    }),
  ]),
  execute: async ({ context }) => {
    const { city } = context
    return fetchWeather(city)
  },
})
```

### Tools Barrel Export

**File: `src/mastra/tools/index.ts`**

```typescript
export { getCurrentWeather } from './getCurrentWeather.js'
```

### Agent Update

**Update `src/mastra/agents/weatherAgent.ts`:**

```typescript
import { Agent } from '@mastra/core/agent'
import { createAgentMemory } from '../index.js'
import { getCurrentWeather } from '../tools/index.js'

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  model: {
    provider: 'GOOGLE',
    name: 'gemini-2.5-flash',
  },
  instructions: `...`, // existing instructions
  memory: createAgentMemory(),
  tools: {
    getCurrentWeather,
  },
  maxSteps: 5,
})
```

### OpenWeatherMap API Reference

**Endpoint:** `https://api.openweathermap.org/data/2.5/weather`

**Parameters:**
- `q` - City name (can include country code: "London,UK")
- `appid` - API key
- `units` - "metric" for Celsius, "imperial" for Fahrenheit

**Response Structure:**
```json
{
  "name": "Paris",
  "sys": { "country": "FR" },
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 72
  },
  "weather": [{
    "main": "Clouds",
    "description": "scattered clouds",
    "icon": "03d"
  }],
  "wind": { "speed": 3.5 }
}
```

**HTTP Status Codes:**
- 200: Success
- 401: Invalid API key
- 404: City not found
- 429: Rate limited
- 5xx: Server error

### File Structure After This Story

```
src/mastra/
├── index.ts
├── agents/
│   └── weatherAgent.ts      # Modified: add tool
├── tools/
│   ├── index.ts             # NEW: barrel export
│   └── getCurrentWeather.ts # NEW: weather tool
└── lib/
    ├── types.ts             # Modified: add weather types
    ├── errorCodes.ts        # Existing
    └── weatherApi.ts        # NEW: API client
```

### Type Additions

**Add to `src/mastra/lib/types.ts`:**

```typescript
// ... existing workingMemorySchema ...

// Weather API types
export interface WeatherData {
  city: string
  country: string
  temperature: number
  feelsLike: number
  humidity: number
  conditions: string
  description: string
  windSpeed: number
}
```

Or keep types in weatherApi.ts as shown above - either approach works.

### Environment Variable

Ensure `.env` has:
```
OPENWEATHERMAP_API_KEY=your_api_key_here
```

Get a free API key from: https://openweathermap.org/api

### Import Rules (ESM)

- All local imports MUST include `.js` extension
- Tool imports: `import { getCurrentWeather } from '../tools/index.js'`

### Testing Scenarios

**Valid City:**
```
Input: "What's the weather in London?"
Expected: Temperature, conditions, humidity for London
```

**Invalid City:**
```
Input: "What's the weather in Xyzzytown?"
Expected: Friendly error about city not found
```

**Missing API Key:**
```
If OPENWEATHERMAP_API_KEY not set
Expected: Error about configuration issue
```

### References

- [Source: _bmad-output/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/architecture.md#Error Handling Strategy]
- [Source: _bmad-output/prd.md#FR5, FR7, FR8]
- [Source: _bmad-output/prd.md#NFR2, NFR8, NFR9]
- [Source: _bmad-output/project-context.md#Tool Definition Rules]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

_To be filled by dev agent after implementation_

### File List

- [ ] `src/mastra/lib/weatherApi.ts` - Created
- [ ] `src/mastra/tools/getCurrentWeather.ts` - Created
- [ ] `src/mastra/tools/index.ts` - Created
- [ ] `src/mastra/agents/weatherAgent.ts` - Modified (add tool)
