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

### Epic 5: Agent Instructions Template Refactoring
**User Outcome:** Developer can maintain, customize, and extend the weather agent's instructions through modular Nunjucks templates.

This epic is a **technical refactoring** that doesn't add new functional requirements but improves maintainability and prepares for Phase 2 customization features.

**Dependencies:** Epic 1-4 complete

### Epic 6: Database Migration to Supabase
**User Outcome:** User data is stored in normalized Supabase PostgreSQL tables, enabling multi-consumer access.

This epic migrates from LibSQL to Supabase with Drizzle ORM for type-safe database operations.

**Dependencies:** Epic 1-4 complete

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

## Epic 5: Agent Instructions Template Refactoring

**User Outcome:** Developer can maintain, customize, and extend the weather agent's instructions through modular Nunjucks templates instead of a monolithic string.

This epic refactors the existing ~600-line instructions string into a modular template system using Nunjucks with Markdown support. This is a prerequisite for Phase 2 features (multi-persona, i18n, web UI customization).

**Dependencies:** Epic 1-4 must be complete (working agent exists)

### Story 5.1: Install Template Dependencies and Setup

As a **developer**,
I want **Nunjucks and related dependencies installed and configured**,
So that **I can use template-based instruction generation**.

**Acceptance Criteria:**

**Given** the project has existing dependencies
**When** I run `npm install nunjucks nunjucks-markdown marked`
**Then** packages are added to package.json
**And** no version conflicts occur with existing dependencies

**Given** TypeScript is used in the project
**When** I run `npm install -D @types/nunjucks`
**Then** type definitions are available for Nunjucks

**Given** the templates directory needs to be created
**When** I create `src/mastra/agents/templates/`
**Then** the directory structure matches architecture spec:
```
src/mastra/agents/templates/
├── index.ts
├── types.ts
└── *.njk files
```

### Story 5.2: Create Template Configuration Types

As a **developer**,
I want **TypeScript interfaces for template configuration**,
So that **template variables are type-safe and documented**.

**Acceptance Criteria:**

**Given** the templates system needs configuration
**When** I create `src/mastra/agents/templates/types.ts`
**Then** it exports `WeatherAgentConfig` interface with:
- `agentName: string` (default: "Sunny")
- `agentRole: string` (default: "weather information specialist")
- `personality: string` (default: "Cheerful, conversational, weather-obsessed")
- `defaultUnit: 'celsius' | 'fahrenheit'` (default: "celsius")
- `greetings?: string[]` (optional custom greetings)
- `ambiguousCities?: string[]` (optional city list)

**And** it exports `defaultConfig` object with all default values

### Story 5.3: Create Template Engine Setup

As a **developer**,
I want **a configured Nunjucks environment with Markdown support**,
So that **templates can be rendered with variable substitution**.

**Acceptance Criteria:**

**Given** Nunjucks dependencies are installed
**When** I create `src/mastra/agents/templates/index.ts`
**Then** it configures Nunjucks Environment with:
- FileSystemLoader pointing to templates directory
- `autoescape: false` (generating text, not HTML)
- `trimBlocks: true` and `lstripBlocks: true`

**And** registers nunjucks-markdown extension with marked renderer

**And** exports `buildInstructions(config?: Partial<WeatherAgentConfig>): string` function

**Given** `buildInstructions()` is called with partial config
**When** the function executes
**Then** it merges with defaultConfig
**And** renders `main.njk` with the merged configuration
**And** returns the complete instructions string

### Story 5.4: Extract Identity and Greeting Templates

As a **developer**,
I want **identity and greeting sections extracted to templates**,
So that **agent personality is configurable**.

**Acceptance Criteria:**

**Given** the current instructions contain IDENTITY section
**When** I create `identity.njk`
**Then** it contains:
- Agent name, role, personality using `{{ agentName }}`, `{{ agentRole }}`, `{{ personality }}`
- GREETING RESPONSES with conditional custom greetings
- Default greetings if none provided

**Given** identity.njk uses template variables
**When** rendered with different agentName values
**Then** the output reflects the configured name throughout

### Story 5.5: Extract Capabilities and Response Formatting Templates

As a **developer**,
I want **capabilities and formatting sections in separate templates**,
So that **each section can be maintained independently**.

**Acceptance Criteria:**

**Given** the current instructions contain CAPABILITIES section
**When** I create `capabilities.njk`
**Then** it lists all agent capabilities (weather info, preferences, conversion, advice)

**Given** the current instructions contain RESPONSE FORMATTING section
**When** I create `responseFormatting.njk`
**Then** it contains:
- Temperature display rules with unit awareness
- Weather conditions descriptive language
- Contextual advice formatting guidelines

### Story 5.6: Extract Error Handling and Conversation Context Templates

As a **developer**,
I want **error handling and context rules in templates**,
So that **error messaging and context behavior are configurable**.

**Acceptance Criteria:**

**Given** the current instructions contain ERROR HANDLING section
**When** I create `errorHandling.njk`
**Then** it contains all error message patterns (city not found, API unavailable, rate limited, missing key)
**And** uses `{{ agentName }}` where appropriate for persona consistency

**Given** the current instructions contain CONVERSATION CONTEXT section
**When** I create `conversationContext.njk`
**Then** it contains context awareness rules, off-topic handling, unclear input handling, empty input handling

### Story 5.7: Extract Intent Classification Template

As a **developer**,
I want **intent classification rules in a dedicated template**,
So that **the complex intent logic is isolated and maintainable**.

**Acceptance Criteria:**

**Given** the current instructions contain INTENT CLASSIFICATION section (~150 lines)
**When** I create `intentClassification.njk`
**Then** it contains:
- Intent category definitions (Weather Query, Preference Update, etc.)
- Weather query indicators with example patterns
- Preference update indicators with example patterns
- Disambiguation rules
- Multi-preference handling
- Tricky cases and "never assume" rules

### Story 5.8: Extract Preference Management Template

As a **developer**,
I want **preference management rules in a template**,
So that **preference handling logic is centralized**.

**Acceptance Criteria:**

**Given** the current instructions contain preference sections
**When** I create `preferenceManagement.njk`
**Then** it consolidates:
- DEFAULT CITY MANAGEMENT (setting, updating, when not to set)
- UNIT PREFERENCE MANAGEMENT (recognizing, setting, switching)
- USER NAME MANAGEMENT (recognizing, storing, using)
- New/returning session greeting rules

### Story 5.9: Extract Weather Handling Template

As a **developer**,
I want **weather query and tool usage rules in a template**,
So that **weather-specific logic is isolated**.

**Acceptance Criteria:**

**Given** the current instructions contain weather handling sections
**When** I create `weatherHandling.njk`
**Then** it contains:
- TOOL USAGE rules
- WEATHER QUERY HANDLING (city specified, no city, never change default)
- TEMPERATURE FORMATTING rules
- TEMPERATURE CONVERSION rules (explicit, contextual, parsing, response formatting)
- FEELS-LIKE TEMPERATURE rules
- WEATHER RESPONSE FORMAT structure
- AMBIGUOUS LOCATION HANDLING with `{{ ambiguousCities }}` if provided

### Story 5.10: Extract Weather Advice Template with Macros

As a **developer**,
I want **weather advice rules in a template with reusable macros**,
So that **temperature-based advice is DRY and unit-aware**.

**Acceptance Criteria:**

**Given** the current instructions contain CONTEXTUAL WEATHER ADVICE section
**When** I create `weatherAdvice.njk`
**Then** it defines a `tempAdvice` macro that accepts:
- label (e.g., "Freezing")
- rangeC (Celsius range string)
- rangeF (Fahrenheit range string)
- advice (array of advice strings)

**And** the macro displays the appropriate range based on `{{ defaultUnit }}`

**And** all temperature ranges use the macro:
- Freezing, Cold, Cool, Pleasant, Warm, Hot

**And** precipitation advice (rain, thunderstorm, snow) is included
**And** special conditions (sunny, windy, humid, fog) are included
**And** combining conditions rules are included

### Story 5.11: Create Main Template and Wire Up

As a **developer**,
I want **a main template that includes all section templates**,
So that **the complete instructions are composed from modular parts**.

**Acceptance Criteria:**

**Given** all section templates exist
**When** I create `main.njk`
**Then** it:
- Opens with the agent introduction using `{{ agentName }}`
- Includes all section templates in logical order via `{% include %}`
- Order: identity → capabilities → responseFormatting → errorHandling → conversationContext → intentClassification → preferenceManagement → weatherHandling → weatherAdvice

**Given** main.njk includes all templates
**When** `buildInstructions()` renders main.njk
**Then** the output matches the structure and content of the original instructions string

### Story 5.12: Integrate Templates with Weather Agent

As a **developer**,
I want **weatherAgent.ts updated to use the template system**,
So that **the agent uses modular, configurable instructions**.

**Acceptance Criteria:**

**Given** the template system is complete
**When** I update `src/mastra/agents/weatherAgent.ts`
**Then** it imports `buildInstructions` from `./templates/index.js`
**And** replaces the inline instructions string with:
```typescript
instructions: buildInstructions({
  agentName: 'Sunny',
  defaultUnit: 'celsius',
})
```

**Given** the agent uses buildInstructions
**When** I run the CLI and interact with the agent
**Then** behavior is identical to before the refactoring
**And** streaming still works correctly
**And** all tools function as expected

### Story 5.13: Add Template Unit Tests

As a **developer**,
I want **unit tests for the template system**,
So that **template rendering is verified and regressions are caught**.

**Acceptance Criteria:**

**Given** the template system is implemented
**When** I create `tests/mastra/agents/templates/index.test.ts`
**Then** it tests:
- `buildInstructions()` with default config produces valid output
- `buildInstructions()` with custom agentName substitutes correctly
- `buildInstructions()` with custom greetings array uses them
- `buildInstructions()` with defaultUnit='fahrenheit' shows Fahrenheit ranges
- Output contains all expected section headers
- No undefined or empty variable substitutions

**Given** tests pass
**When** I run `npm test`
**Then** all template tests pass
**And** no regressions in existing tests

## Epic 6: Database Migration to Supabase

**User Outcome:** User data (preferences, name, default city) is stored in normalized Supabase PostgreSQL tables, enabling multi-consumer access from other agents, mobile apps, and web services.

This epic migrates from LibSQL file-based storage to Supabase PostgreSQL with Drizzle ORM, using a custom SupabaseStore class that extends PostgresStore. User data is normalized into separate `users` and `user_preferences` tables instead of Mastra's default JSON blob.

**Dependencies:** Epic 1-4 complete (working agent with preferences)

**Architecture Reference:** See "Database Migration: LibSQL to Supabase (Phase 2)" section in architecture.md

### Story 6.1: Setup Drizzle Schema and Database Client

As a **developer**,
I want **Drizzle ORM configured with schema definitions for users and preferences tables**,
So that **I have type-safe database access for custom tables**.

**Acceptance Criteria:**

**Given** the project needs Supabase integration
**When** I create `src/db/schema.ts`
**Then** it defines:
- `weatherSchema` using `pgSchema('weather')`
- `users` table with: id (UUID PK), username (TEXT), location (TEXT), created_at, updated_at
- `userPreferences` table with: id (UUID PK), user_id (UUID FK to users), units (TEXT), created_at, updated_at
**And** `userPreferences.userId` has a unique constraint and CASCADE delete

**Given** the schema is defined
**When** I create `src/db/index.ts`
**Then** it initializes a pg Pool with `SUPABASE_DATABASE_URL`
**And** exports a configured Drizzle instance with the schema

**Given** Drizzle Kit is needed for migrations
**When** I create `drizzle.config.ts`
**Then** it configures:
- Schema path: `./src/db/schema.ts`
- Output path: `./drizzle`
- Dialect: `postgresql`
- DB credentials from `SUPABASE_DATABASE_URL`

### Story 6.2: Create Database Tables in Supabase

As a **developer**,
I want **the `weather` schema and tables created in Supabase**,
So that **user data has a place to be stored**.

**Acceptance Criteria:**

**Given** Drizzle schema is defined and config exists
**When** I run `npm run db:generate`
**Then** migration files are generated in `./drizzle/` directory

**Given** migration files are generated
**When** I run `npm run db:push`
**Then** the `weather` schema is created in Supabase
**And** `weather.users` table is created with correct columns and constraints
**And** `weather.user_preferences` table is created with FK to users
**And** no errors occur during migration

**Given** the tables are created
**When** I check Supabase dashboard or run `npm run db:studio`
**Then** I can see the tables and their structure

### Story 6.3: Implement SupabaseStore Class

As a **developer**,
I want **a custom storage adapter that extends PostgresStore and uses Drizzle for user data**,
So that **Mastra's memory system works with normalized tables**.

**Acceptance Criteria:**

**Given** Drizzle is configured
**When** I create `src/mastra/lib/storage/supabaseStore.ts`
**Then** it exports `SupabaseStore` class extending `PostgresStore`
**And** the constructor accepts `{ connectionString: string }`
**And** it initializes a Drizzle instance for custom queries

**Given** SupabaseStore is implemented
**When** `getResourceById({ resourceId })` is called with a valid UUID
**Then** it queries `weather.users` LEFT JOIN `weather.user_preferences`
**And** reconstructs workingMemory JSON: `{ default_city, user_name, preferred_units }`
**And** returns `StorageResourceType` with id, workingMemory, createdAt, updatedAt
**And** returns `null` if user not found

**Given** SupabaseStore is implemented
**When** `saveResource({ resource })` is called with a new user UUID
**Then** it parses resource.workingMemory JSON
**And** uses a Drizzle transaction to:
  - INSERT into users (id, username, location)
  - INSERT into user_preferences (user_id, units)
**And** handles conflicts gracefully (ON CONFLICT DO NOTHING)
**And** returns the saved resource via getResourceById

**Given** SupabaseStore is implemented
**When** `updateResource({ resourceId, workingMemory })` is called
**Then** it parses workingMemory JSON
**And** uses a Drizzle transaction to:
  - UPSERT users (preserve existing values for null fields)
  - UPSERT user_preferences
**And** uses `onConflictDoUpdate` for both tables
**And** returns the updated resource via getResourceById

### Story 6.4: Create Storage Export Barrel

As a **developer**,
I want **clean exports for the storage module**,
So that **imports are simple and consistent**.

**Acceptance Criteria:**

**Given** SupabaseStore is implemented
**When** I create `src/mastra/lib/storage/index.ts`
**Then** it exports `SupabaseStore` class
**And** exports any necessary types

### Story 6.5: Integrate SupabaseStore with Memory Configuration

As a **developer**,
I want **the application to use SupabaseStore instead of LibSQLStore**,
So that **user data is stored in Supabase**.

**Acceptance Criteria:**

**Given** SupabaseStore is ready
**When** I update `src/mastra/lib/memory.ts`
**Then** it imports `SupabaseStore` from `./storage/index.js`
**And** replaces `LibSQLStore` with:
```typescript
export const storage = new SupabaseStore({
  connectionString: process.env.SUPABASE_DATABASE_URL!,
})
```
**And** removes `@mastra/libsql` import

**Given** `SUPABASE_DATABASE_URL` is not set
**When** the application starts
**Then** it throws a clear error about missing environment variable

### Story 6.6: Add Database Scripts to package.json

As a **developer**,
I want **convenient npm scripts for database operations**,
So that **I can easily manage migrations and inspect the database**.

**Acceptance Criteria:**

**Given** Drizzle Kit is installed
**When** I update `package.json`
**Then** it includes scripts:
```json
{
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

**Given** the scripts are added
**When** I run `npm run db:studio`
**Then** Drizzle Studio opens in browser for database inspection

### Story 6.7: End-to-End Integration Testing

As a **developer**,
I want **to verify the complete integration works**,
So that **I'm confident user preferences persist correctly in Supabase**.

**Acceptance Criteria:**

**Given** SupabaseStore is integrated
**When** I run the CLI and set a default city ("Tokyo")
**Then** the preference is stored in `weather.users.location`
**And** I can verify in Supabase dashboard that the row exists

**Given** I set preferred units to "fahrenheit"
**When** I check the database
**Then** `weather.user_preferences.units` shows "fahrenheit"

**Given** I exit the CLI and restart it
**When** I ask "What's the weather?"
**Then** the agent uses my saved default city (Tokyo)
**And** displays temperature in my preferred units (Fahrenheit)

**Given** a new user UUID is provided
**When** the agent saves their preferences
**Then** both `users` and `user_preferences` rows are created atomically
**And** no orphan records exist

**Given** working memory is updated with partial data
**When** only `default_city` is changed
**Then** `username` and `units` retain their previous values

