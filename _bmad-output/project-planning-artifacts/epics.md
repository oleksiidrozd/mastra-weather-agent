---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/architecture.md'
project_name: 'mastra-weather-agent'
user_name: 'Oleksii'
date: '2025-12-25'
---

# mastra-weather-agent - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mastra-weather-agent, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Core Agent Capabilities (FR1-FR4):**
- FR1: User can send natural language messages to the agent via CLI
- FR2: Agent can respond with streaming text output (token-by-token)
- FR3: Agent can classify user intent (weather query, preference update, greeting, off-topic, unclear)
- FR4: Agent can maintain a defined persona in all responses

**Weather Information (FR5-FR9):**
- FR5: User can request current weather for a specific city
- FR6: User can request current weather without specifying city (uses default)
- FR7: Agent can retrieve real-time weather data from OpenWeatherMap API
- FR8: Agent can format weather information with temperature, conditions, and humidity
- FR9: Agent can include contextual advice in weather responses (e.g., "bring an umbrella")

**Temperature Conversion (FR10-FR12):**
- FR10: User can request temperature conversion from Celsius to Fahrenheit
- FR11: User can request temperature conversion from Fahrenheit to Celsius
- FR12: Agent can use conversation context to understand which temperature to convert

**Preference Management (FR13-FR17):**
- FR13: User can set a default city for weather queries
- FR14: User can set preferred temperature units (Celsius/Fahrenheit)
- FR15: Agent can persist user preferences across conversation turns
- FR16: Agent can persist user preferences across sessions (restart CLI)
- FR17: Agent can confirm preference changes to the user

**Session Management (FR18-FR20):**
- FR18: User can start a new conversation session
- FR19: User can exit the CLI application
- FR20: Agent can greet returning users by name (from working memory)

**Error Handling & Edge Cases (FR21-FR25):**
- FR21: Agent can handle off-topic requests with polite redirection
- FR22: Agent can handle unclear/gibberish input gracefully
- FR23: Agent can request clarification for ambiguous locations
- FR24: Agent can handle API failures with user-friendly error messages
- FR25: Agent can handle missing API keys with clear error messages

### NonFunctional Requirements

**Performance (NFR1-NFR4):**
- NFR1: Agent streaming response should begin within 2 seconds of user input
- NFR2: Weather API calls should complete within 5 seconds
- NFR3: Working memory reads/writes should complete within 100ms
- NFR4: CLI should remain responsive during streaming (no blocking)

**Security (NFR5-NFR7):**
- NFR5: API keys must be stored in environment variables, never in code
- NFR6: API keys must not be logged or displayed to users
- NFR7: `.env` file must be gitignored

**Integration (NFR8-NFR10):**
- NFR8: System must handle OpenWeatherMap API rate limits gracefully
- NFR9: System must handle network connectivity failures with retry or clear error
- NFR10: System must work with OpenWeatherMap free tier (60 calls/minute limit)

**Reliability (NFR11-NFR13):**
- NFR11: CLI must not crash on malformed user input
- NFR12: CLI must handle graceful shutdown on Ctrl+C
- NFR13: Memory persistence must survive CLI restarts

### Additional Requirements

**From Architecture Document:**

- Mastra starter template already initialized (project structure exists)
- LibSQL file-based storage at `file:mastra.db`
- Working memory schema with Zod validation: `{ default_city?, preferred_units, user_name? }`
- Conversation history: Thread-scoped, last 20 messages
- Shared API client pattern at `src/mastra/lib/weatherApi.ts`
- Error code enum: CITY_NOT_FOUND, API_KEY_INVALID, API_UNAVAILABLE, RATE_LIMITED
- CLI streaming via `process.stdout.write()` for each chunk
- Fixed thread ID per CLI session, regenerate on "new session"
- Resource ID: Fixed string "cli-user" for working memory persistence
- Model: Google Gemini 2.5 Flash with maxSteps: 3
- Tool output schema: `{ success: true, data: {...} }` or `{ success: false, errorCode: "..." }`
- npm scripts: dev, cli, build, test
- Tests in top-level `tests/` folder mirroring `src/`

**Implementation Sequence (from Architecture):**
1. Mastra instance with LibSQL storage
2. Working memory schema
3. Weather API client
4. Tools (4)
5. Agent with persona
6. CLI entry point

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Send natural language messages via CLI |
| FR2 | Epic 1 | Streaming text output |
| FR3 | Epic 3 | Intent classification (preference updates) |
| FR4 | Epic 1 | Defined persona |
| FR5 | Epic 2 | Weather for specific city |
| FR6 | Epic 3 | Weather without city (uses default) |
| FR7 | Epic 2 | OpenWeatherMap API integration |
| FR8 | Epic 2 | Format weather information |
| FR9 | Epic 2 | Contextual advice |
| FR10 | Epic 4 | C to F conversion |
| FR11 | Epic 4 | F to C conversion |
| FR12 | Epic 4 | Conversation context for conversion |
| FR13 | Epic 3 | Set default city |
| FR14 | Epic 3 | Set preferred units |
| FR15 | Epic 3 | Persist across conversation turns |
| FR16 | Epic 3 | Persist across sessions |
| FR17 | Epic 3 | Confirm preference changes |
| FR18 | Epic 4 | Start new session |
| FR19 | Epic 1 | Exit CLI |
| FR20 | Epic 3 | Greet returning users |
| FR21 | Epic 2 | Handle off-topic |
| FR22 | Epic 2 | Handle gibberish |
| FR23 | Epic 2 | Clarify ambiguous locations |
| FR24 | Epic 2 | Handle API failures |
| FR25 | Epic 2 | Handle missing API keys |

## Epic List

### Epic 1: Foundation & Core Agent Setup
**User Outcome:** Developer can run the CLI and have a basic agent conversation with streaming responses.

This epic establishes the foundational infrastructure so subsequent epics have a working agent to build upon.

**FRs covered:** FR1, FR2, FR4, FR19

### Epic 2: Weather Information Retrieval
**User Outcome:** User can ask about weather in any city and get accurate, formatted weather information.

**FRs covered:** FR5, FR7, FR8, FR9, FR21, FR22, FR23, FR24, FR25

### Epic 3: User Preferences & Memory Persistence
**User Outcome:** User can set preferences (default city, units) that persist across sessions, and the agent remembers them.

**FRs covered:** FR3, FR6, FR13, FR14, FR15, FR16, FR17, FR20

### Epic 4: Temperature Conversion & Session Management
**User Outcome:** User can convert temperatures and manage conversation sessions.

**FRs covered:** FR10, FR11, FR12, FR18

## Epic 1: Foundation & Core Agent Setup

**User Outcome:** Developer can run the CLI and have a basic agent conversation with streaming responses.

### Story 1.1: Configure Mastra Instance with LibSQL Storage

As a **developer**,
I want **a configured Mastra instance with persistent LibSQL storage**,
So that **I have the foundation for memory-enabled agent operations**.

**Acceptance Criteria:**

**Given** the project has Mastra dependencies installed
**When** I run the application
**Then** Mastra creates/connects to `mastra.db` file
**And** working memory schema is defined with Zod (`{ default_city?, preferred_units, user_name? }`)
**And** no errors occur on initialization

### Story 1.2: Create Weather Agent with Persona

As a **developer**,
I want **an agent with a defined persona and maxSteps configuration**,
So that **conversations have a consistent, memorable personality**.

**Acceptance Criteria:**

**Given** the Mastra instance is configured
**When** the agent is initialized
**Then** the agent uses Google Gemini 2.5 Flash model
**And** maxSteps is set to 3
**And** the agent has a friendly, weather-focused persona defined in system prompt
**And** the agent can respond to basic greetings in character

### Story 1.3: Implement CLI with Streaming Responses

As a **user**,
I want **to interact with the agent via CLI with real-time streaming responses**,
So that **I see tokens appear immediately as they're generated**.

**Acceptance Criteria:**

**Given** the agent is running
**When** I type a message and press Enter
**Then** the agent's response streams token-by-token to console
**And** streaming begins within 2 seconds (NFR1)
**And** the CLI remains responsive during streaming (NFR4)

**Given** I type "exit" or "quit"
**When** I press Enter
**Then** the CLI exits gracefully
**And** database connections are closed

**Given** I press Ctrl+C
**When** the CLI is running
**Then** the CLI exits gracefully with SIGINT handling (NFR12)

### Story 1.4: Environment Configuration and Security

As a **developer**,
I want **secure API key configuration via environment variables**,
So that **secrets are never hardcoded or exposed**.

**Acceptance Criteria:**

**Given** `.env` file contains `GOOGLE_GENERATIVE_AI_API_KEY` and `OPENWEATHERMAP_API_KEY`
**When** the application starts
**Then** API keys are loaded from environment variables (NFR5)
**And** API keys are never logged or displayed (NFR6)

**Given** `.env` file is missing required keys
**When** the application starts
**Then** a clear error message indicates which keys are missing
**And** the application exits gracefully

**Given** the project has a `.gitignore` file
**When** I check its contents
**Then** `.env` and `mastra.db` are excluded (NFR7)

## Epic 2: Weather Information Retrieval

**User Outcome:** User can ask about weather in any city and get accurate, formatted weather information.

### Story 2.1: Create Weather API Client

As a **developer**,
I want **a shared OpenWeatherMap API client with proper error handling**,
So that **weather data retrieval is centralized and consistent**.

**Acceptance Criteria:**

**Given** the `OPENWEATHERMAP_API_KEY` environment variable is set
**When** I call the weather API client with a valid city
**Then** it returns weather data with temperature, conditions, and humidity
**And** the API call completes within 5 seconds (NFR2)

**Given** an invalid city name is provided
**When** I call the weather API client
**Then** it returns `{ success: false, errorCode: "CITY_NOT_FOUND" }`

**Given** the API key is invalid
**When** I call the weather API client
**Then** it returns `{ success: false, errorCode: "API_KEY_INVALID" }`

**Given** the API is unavailable or returns 5xx
**When** I call the weather API client
**Then** it returns `{ success: false, errorCode: "API_UNAVAILABLE" }` (NFR9)

**Given** the API rate limit is exceeded
**When** I call the weather API client
**Then** it returns `{ success: false, errorCode: "RATE_LIMITED" }` (NFR8)

### Story 2.2: Implement getCurrentWeather Tool

As a **user**,
I want **to ask for weather in a specific city**,
So that **I get accurate current weather information**.

**Acceptance Criteria:**

**Given** the agent is running
**When** I ask "What's the weather in Paris?"
**Then** the agent calls `getCurrentWeather` with city="Paris"
**And** returns formatted weather with temperature, conditions, and humidity (FR8)
**And** includes contextual advice like "bring an umbrella" if raining (FR9)

**Given** I ask about weather in an ambiguous location like "Springfield"
**When** the agent processes my request
**Then** it asks for clarification: "Which Springfield did you mean?" (FR23)

### Story 2.3: Handle Edge Cases and Errors

As a **user**,
I want **graceful handling of invalid inputs and API errors**,
So that **I always get a helpful response instead of crashes**.

**Acceptance Criteria:**

**Given** I ask an off-topic question like "Tell me about Bitcoin"
**When** the agent processes my request
**Then** it politely redirects to weather topics (FR21)
**And** responds in persona: "I don't have information on this topic. Let's discuss weather instead!"

**Given** I type gibberish like "asdfghjkl"
**When** the agent processes my request
**Then** it responds gracefully: "Sorry, I didn't understand. Could you repeat that?" (FR22)
**And** the CLI does not crash (NFR11)

**Given** the OpenWeatherMap API is unavailable
**When** I ask for weather
**Then** the agent responds with a user-friendly message (FR24)
**And** does not expose technical error details

**Given** the API key is missing or invalid
**When** I ask for weather
**Then** the agent responds with a clear error about configuration (FR25)

## Epic 3: User Preferences & Memory Persistence

**User Outcome:** User can set preferences (default city, units) that persist across sessions, and the agent remembers them.

### Story 3.1: Implement setDefaultCity Tool

As a **user**,
I want **to set my default city for weather queries**,
So that **I don't have to specify my city every time I ask about weather**.

**Acceptance Criteria:**

**Given** the agent is running
**When** I say "Set my default city to London"
**Then** the agent calls `setDefaultCity` with city="London"
**And** the preference is saved to working memory
**And** the agent confirms: "I've set your default city to London" (FR17)

**Given** I have set a default city
**When** I ask "What's the weather?" without specifying a city
**Then** the agent uses my default city for the weather query (FR6)
**And** mentions which city it's using in the response

**Given** working memory operations
**When** I set or retrieve preferences
**Then** the operation completes within 100ms (NFR3)

### Story 3.2: Implement setPreferredUnits Tool

As a **user**,
I want **to set my preferred temperature units (Celsius or Fahrenheit)**,
So that **weather information is displayed in my preferred format**.

**Acceptance Criteria:**

**Given** the agent is running
**When** I say "I prefer Fahrenheit" or "Use Celsius"
**Then** the agent calls `setPreferredUnits` with the appropriate unit
**And** the preference is saved to working memory
**And** the agent confirms the change (FR17)

**Given** I have set preferred units to Fahrenheit
**When** I ask for weather information
**Then** temperatures are displayed in Fahrenheit (FR14)

**Given** I have not set a unit preference
**When** I ask for weather information
**Then** the agent uses a sensible default (Celsius)

### Story 3.3: Persist Preferences Across Sessions

As a **user**,
I want **my preferences to be remembered when I restart the CLI**,
So that **I don't have to reconfigure my settings every time**.

**Acceptance Criteria:**

**Given** I have set a default city and preferred units
**When** I exit the CLI and restart it
**Then** my preferences are still available (FR16)
**And** the agent can use them without me re-entering them

**Given** I am a returning user with saved preferences
**When** I start a new CLI session
**Then** the agent can greet me by name if I've provided it (FR20)
**And** uses my saved default city and units

**Given** working memory is stored in LibSQL
**When** the CLI restarts
**Then** the `mastra.db` file persists my preferences (NFR13)

### Story 3.4: Intent Classification for Preference Updates

As a **user**,
I want **the agent to understand when I'm updating preferences vs. asking about weather**,
So that **my requests are handled correctly**.

**Acceptance Criteria:**

**Given** I say "Remember that I live in Tokyo"
**When** the agent processes my request
**Then** it classifies this as a preference update intent (FR3)
**And** updates my default city accordingly

**Given** I say "What's the weather in Tokyo?"
**When** the agent processes my request
**Then** it classifies this as a weather query (not a preference update)
**And** does not change my default city

**Given** I say "My name is Alex"
**When** the agent processes my request
**Then** it saves my name to working memory
**And** can use it in future greetings (FR20)

## Epic 4: Temperature Conversion & Session Management

**User Outcome:** User can convert temperatures and manage conversation sessions.

### Story 4.1: Implement convertTemperature Tool

As a **user**,
I want **to convert temperatures between Celsius and Fahrenheit**,
So that **I can understand temperatures in my preferred unit**.

**Acceptance Criteria:**

**Given** the agent is running
**When** I ask "Convert 32°F to Celsius"
**Then** the agent calls `convertTemperature` and responds with "32°F is 0°C" (FR11)

**Given** the agent is running
**When** I ask "What is 25°C in Fahrenheit?"
**Then** the agent responds with "25°C is 77°F" (FR10)

**Given** I just received weather information showing 20°C
**When** I ask "What's that in Fahrenheit?"
**Then** the agent uses conversation context to convert 20°C to 68°F (FR12)
**And** does not ask me to specify which temperature

### Story 4.2: Implement New Session Command

As a **user**,
I want **to start a fresh conversation session**,
So that **I can begin a new interaction without previous context**.

**Acceptance Criteria:**

**Given** I have an ongoing conversation with history
**When** I type "new session" or "start over"
**Then** a new thread ID is generated (FR18)
**And** the conversation history is cleared
**And** the agent greets me as if starting fresh

**Given** I start a new session
**When** I continue chatting
**Then** the agent does not reference previous conversation context
**And** my saved preferences (default city, units) are still available

