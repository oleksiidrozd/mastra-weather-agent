---
stepsCompleted: [1, 2, 3]
inputDocuments: ['docs/context/product_brief.md']
session_topic: 'Mastra weather agent - persona, interaction style, CLI→React architecture'
session_goals: 'Learn Mastra, define precise agent personality, plan technical stack'
selected_approach: 'ai-recommended'
techniques_used: ['Decision Tree Mapping']
ideas_generated: ['4-tool architecture', 'working memory structure', 'CLI readline approach', 'shared core pattern']
context_file: '_bmad/bmm/data/project-context-template.md'
---

# Brainstorming Session Results

**Facilitator:** Oleksii
**Date:** 2025-12-25

---

## Session Overview

**Topic:** Mastra weather agent - persona, interaction style, CLI→React architecture

**Goals:** Learn Mastra framework by building a weather agent with precise communication style, starting with CLI and evolving to React UI

### Context Guidance

This session focused on software and product development considerations for a Mastra AI Agent demo project, specifically designing a weather agent that demonstrates proficiency in core concepts: memory, streaming, tools, and personas.

---

## Technique Selection

**Approach:** AI-Recommended Techniques

**Analysis Context:** Technical + Creative session requiring both personality design and architecture planning

**Technique Used:** Decision Tree Mapping (Structured Category)

**AI Rationale:** Decision Tree Mapping was selected to map out all decision paths for the weather agent - from user input through Mastra processing to response output. This revealed workflow structure, tool triggers, and CLI→React architecture in a systematic way.

---

## Decision Tree Mapping Results

### 1. Message Classification Layer

User messages are classified into four intent categories:

| Intent | Examples | Agent Response |
|--------|----------|----------------|
| **Weather Query** | "What's the weather?", "Weather in Paris" | Call `getCurrentWeather` tool |
| **Greeting** | "Hey Agent!" | Friendly response, optionally with weather |
| **Preference Update** | "I'm in Kyiv", "Use Fahrenheit" | Update Working Memory |
| **Edge Cases** | Off-topic, gibberish, unclear location | Polite redirect or clarification |

#### Full Message Classification Decision Tree

```
USER MESSAGE ARRIVES
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    INTENT CLASSIFICATION                       │
│            (Mastra Agent analyzes message)                     │
└───────────────────────────────────────────────────────────────┘
        │
        ├─── WEATHER QUERY ────────────────────┐
        │    • "What's the weather?"           │
        │    • "Weather in Paris"              │
        │    • "Will it rain today?"           │
        │                                      ▼
        │                            ┌─────────────────┐
        │                            │ HAS LOCATION?   │
        │                            └─────────────────┘
        │                               │         │
        │                              YES        NO
        │                               │         │
        │                               ▼         ▼
        │                           [CALL      [CHECK MEMORY
        │                            WEATHER    FOR DEFAULT
        │                            TOOL]      CITY]
        │                                          │
        │                                    Found? ──NO──► ASK: "Which city?"
        │                                      │
        │                                     YES
        │                                      │
        │                                      ▼
        │                                  [CALL WEATHER TOOL]
        │
        ├─── GREETING ─────────────────────────┐
        │    • "Hey {Agent}!"                  │
        │    • "Hi, what's the weather?"       │
        │                                      ▼
        │                            ┌─────────────────┐
        │                            │ GREETING ONLY   │
        │                            │ or WITH QUERY?  │
        │                            └─────────────────┘
        │                               │         │
        │                            ONLY      +QUERY
        │                               │         │
        │                               ▼         ▼
        │                          [FRIENDLY   [GREET +
        │                           RESPONSE]   ROUTE TO
        │                                       WEATHER QUERY]
        │
        ├─── PREFERENCE UPDATE ────────────────┐
        │    • "I'm in Kyiv"                   │
        │    • "Convert to Fahrenheit"         │
        │                                      ▼
        │                            ┌─────────────────┐
        │                            │ PREF TYPE?      │
        │                            └─────────────────┘
        │                               │         │
        │                            CITY      UNITS
        │                               │         │
        │                               ▼         ▼
        │                          [SAVE TO   [CONVERT &
        │                           MEMORY]    SAVE PREF]
        │                               │         │
        │                               ▼         ▼
        │                          "Got it,   [RE-DISPLAY
        │                           {City}!"   LAST WEATHER
        │                                      IN NEW UNIT]
        │
        └─── EDGE CASES ───────────────────────┐
             • Off-topic                        │
             • Gibberish                        │
             • Unclear location                 │
                                               ▼
                                     ┌─────────────────┐
                                     │ EDGE TYPE?      │
                                     └─────────────────┘
                                        │    │    │
                                   OFF  GIB  UNCLEAR
                                   TOPIC RISH LOCATION
                                        │    │    │
                                        ▼    ▼    ▼
                                    "Let's  "Could  "Which
                                     talk   you     city did
                                     weather repeat?" you mean?"
                                     :)"
```

#### Edge Case Responses
- **Off-topic:** "Excuse me, I don't have information on this topic. Let's discuss weather instead! :)"
- **Gibberish:** "Sorry, I didn't understand your question. Could you repeat that?"
- **Unclear location:** Ask for clarification

---

### 2. Weather Tool Execution Flow

**API:** OpenWeatherMap (`https://api.openweathermap.org/data/2.5/weather`)

**Data Fields Returned:**
- `temp` - Temperature value
- `humidity` - Humidity percentage
- `conditions` - Weather description
- `icon` - Weather icon code (for React UI)
- `time_of_day` - Derived from API timezone or system time
- `conclusion` - Contextual advice based on conditions

#### Full Weather Tool Execution Decision Tree

```
WEATHER TOOL CALLED
    │
    │  Input: { city, country?, units }
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                 OPENWEATHERMAP API CALL                        │
│         https://api.openweathermap.org/data/2.5/weather        │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────┐
│ API RESPONSE?   │
└─────────────────┘
    │         │
 SUCCESS    ERROR
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ ERROR TYPE?     │
    │    └─────────────────┘
    │       │       │       │
    │    404     401      5xx
    │    NOT    INVALID   SERVER
    │    FOUND   API KEY   ERROR
    │       │       │       │
    │       ▼       ▼       ▼
    │    "City   "Config  "Weather
    │     not     error"   service
    │     found"           unavailable"
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    PARSE API RESPONSE                          │
│                                                                │
│  Extract:                                                      │
│  • temp        → main.temp                                     │
│  • humidity    → main.humidity                                 │
│  • conditions  → weather[0].description                        │
│  • icon        → weather[0].icon (for React UI)                │
│  • timezone    → timezone (offset in seconds)                  │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│               DETERMINE TIME OF DAY                            │
│                                                                │
│  API has timezone? ──YES──► Calculate local time from          │
│       │                     UTC + timezone offset              │
│       NO                                                       │
│       │                                                        │
│       ▼                                                        │
│  Use system time                                               │
│                                                                │
│  ┌─────────────────────────────────────────┐                   │
│  │ LOCAL HOUR →  TIME_OF_DAY               │                   │
│  │─────────────────────────────────────────│                   │
│  │ 5-11        → "morning"                 │                   │
│  │ 12-16       → "afternoon"               │                   │
│  │ 17-20       → "evening"                 │                   │
│  │ 21-4        → "night"                   │                   │
│  └─────────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│               DETERMINE CONCLUSION                             │
│                                                                │
│  conditions includes:                                          │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ CONDITION         │ CONCLUSION                      │       │
│  │───────────────────│─────────────────────────────────│       │
│  │ "clear", "sunny"  │ "Enjoy your sunny day!"         │       │
│  │ "cloud"           │ "A bit overcast, but pleasant"  │       │
│  │ "fog", "mist"     │ "Drive carefully in low         │       │
│  │                   │  visibility"                    │       │
│  │ "rain", "drizzle" │ "Don't forget your umbrella!"   │       │
│  │ "snow"            │ "Bundle up, it's snowy!"        │       │
│  │ "thunder"         │ "Stay safe indoors if possible" │       │
│  │ DEFAULT           │ "Have a great day!"             │       │
│  └─────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                  TOOL RETURNS TO AGENT                         │
│                                                                │
│  {                                                             │
│    temp: 22,                                                   │
│    humidity: 65,                                               │
│    conditions: "partly cloudy",                                │
│    icon: "02d",           // React UI only                     │
│    time_of_day: "morning",                                     │
│    conclusion: "A bit overcast, but pleasant",                 │
│    city: "Kyiv",                                               │
│    units: "celsius"                                            │
│  }                                                             │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              AGENT FORMATS RESPONSE                            │
│                                                                │
│  "Hey {user_name}, as of this {time_of_day}, the weather      │
│   in {city} is {conditions} at {temp}°{unit} with {humidity}%  │
│   humidity. {conclusion}"                                      │
│                                                                │
│  EXAMPLE:                                                      │
│  "Hey Oleksii, as of this morning, the weather in Kyiv is     │
│   partly cloudy at 22°C with 65% humidity. A bit overcast,    │
│   but pleasant."                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Time of Day Logic
| Local Hour | Time of Day |
|------------|-------------|
| 5-11 | morning |
| 12-16 | afternoon |
| 17-20 | evening |
| 21-4 | night |

#### Conclusion Logic
| Condition | Conclusion |
|-----------|------------|
| clear, sunny | "Enjoy your sunny day!" |
| cloud | "A bit overcast, but pleasant" |
| fog, mist | "Drive carefully in low visibility" |
| rain, drizzle | "Don't forget your umbrella!" |
| snow | "Bundle up, it's snowy!" |
| thunder | "Stay safe indoors if possible" |
| DEFAULT | "Have a great day!" |

#### Response Template
```
"Hey {user_name}, as of this {time_of_day}, the weather in {city} is
{conditions} at {temp}°{unit} with {humidity}% humidity. {conclusion}"
```

---

### 3. Mastra Architecture Decisions

#### Full Mastra Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    MASTRA WEATHER AGENT                        │
│                                                                │
│  Model: Google Gemini 2.5 Flash (gemini-2.5-flash)             │
│  maxSteps: 3 (classify → tool call → respond)                  │
└───────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                       MEMORY LAYER                             │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  WORKING MEMORY (persists across conversations)                │
│  ┌─────────────────────────────────────────────┐               │
│  │ {                                           │               │
│  │   default_city: "Kyiv, Ukraine",            │               │
│  │   preferred_units: "celsius",               │               │
│  │   user_name: "Oleksii"                      │               │
│  │ }                                           │               │
│  └─────────────────────────────────────────────┘               │
│                                                                │
│  CONVERSATION HISTORY (thread-scoped)                          │
│  ┌─────────────────────────────────────────────┐               │
│  │ [                                           │               │
│  │   { role: "user", content: "..." },         │               │
│  │   { role: "assistant", content: "..." },    │               │
│  │   // Previous weather queries live here     │               │
│  │   // Enables: "what about tomorrow?"        │               │
│  │ ]                                           │               │
│  └─────────────────────────────────────────────┘               │
│                                                                │
└───────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                        TOOLS (4)                               │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TOOL 1: getCurrentWeather                               │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ description: "Get current weather for a city"           │   │
│  │ Action: Calls OpenWeatherMap API                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TOOL 2: setDefaultCity                                  │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ description: "Save user's default city"                 │   │
│  │ Action: Updates Working Memory → default_city           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TOOL 3: setPreferredUnits                               │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ description: "Save user's preferred temperature units"  │   │
│  │ Action: Updates Working Memory → preferred_units        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TOOL 4: convertTemperature                              │   │
│  │─────────────────────────────────────────────────────────│   │
│  │ description: "Convert temperature between C and F"      │   │
│  │ Action: Pure calculation, no API call                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

#### Model
- **Google Gemini 2.5 Flash** (`gemini-2.5-flash`)
- Fast, capable, latest features

#### maxSteps
- **3** (classify → tool call → respond)
- Prevents infinite loops, manages token usage

#### Workflows
- **Not needed** - Single agent with tools handles all use cases
- May revisit if multi-step orchestration required later

---

### 4. Memory Structure

#### Working Memory (Persists Across Conversations)
```typescript
{
  default_city: "Kyiv, Ukraine",
  preferred_units: "celsius",
  user_name: "Oleksii"
}
```

#### Conversation History (Thread-Scoped)
- Previous messages in current session
- Enables follow-up queries: "What about tomorrow?", "What's that in Fahrenheit?"

---

### 5. Tools Architecture (4 Tools)

#### Tool 1: getCurrentWeather
```typescript
{
  description: "Get current weather for a city",
  inputSchema: {
    city: string,        // required
    country?: string,    // optional
    units?: "celsius" | "fahrenheit"  // optional
  },
  outputSchema: {
    temp, humidity, conditions, icon,
    time_of_day, conclusion, city, units
  }
}
// Action: Calls OpenWeatherMap API
```

#### Tool 2: setDefaultCity
```typescript
{
  description: "Save user's default city for weather queries when no city is specified",
  inputSchema: {
    city: string,        // required
    country?: string     // optional
  },
  outputSchema: {
    success: boolean,
    message: string
  }
}
// Action: Updates Working Memory → default_city
```

#### Tool 3: setPreferredUnits
```typescript
{
  description: "Save user's preferred temperature units (celsius or fahrenheit)",
  inputSchema: {
    units: "celsius" | "fahrenheit"  // required
  },
  outputSchema: {
    success: boolean,
    message: string
  }
}
// Action: Updates Working Memory → preferred_units
```

#### Tool 4: convertTemperature
```typescript
{
  description: "Convert a temperature value between celsius and fahrenheit",
  inputSchema: {
    value: number,                           // required
    from: "celsius" | "fahrenheit",          // required
    to: "celsius" | "fahrenheit"             // required
  },
  outputSchema: {
    original: { value, unit },
    converted: { value, unit }
  }
}
// Action: Pure calculation, no API call
```

---

### 6. Agent Decision Flow

#### Full Agent Tool Routing Diagram

```
USER MESSAGE
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              AGENT ANALYZES MESSAGE                            │
│         (LLM decides based on tool descriptions)               │
└───────────────────────────────────────────────────────────────┘
    │
    │ Which tool (if any)?
    │
    ├─── "What's the weather in Paris?" ────► getCurrentWeather
    │                                              │
    │                                              ▼
    │                                         { city: "Paris" }
    │
    ├─── "What's the weather?" (no city) ───► Agent checks Working Memory
    │         │                                    │
    │         │                               Has default_city?
    │         │                                  │        │
    │         │                                 YES       NO
    │         │                                  │        │
    │         │                                  ▼        ▼
    │         │                          getCurrentWeather  "Which city?"
    │         │                          { city: default }
    │
    ├─── "I'm in Kyiv now" ─────────────► setDefaultCity
    │                                          │
    │                                          ▼
    │                                     { city: "Kyiv" }
    │
    ├─── "Use Fahrenheit please" ───────► setPreferredUnits
    │                                          │
    │                                          ▼
    │                                     { units: "fahrenheit" }
    │
    ├─── "What's that in Fahrenheit?" ──► convertTemperature
    │         │                                │
    │         │                                ▼
    │         │                          { value: 22,
    │         │                            from: "celsius",
    │         │                            to: "fahrenheit" }
    │         │
    │         └──► (Agent reads last temp from Conversation History)
    │
    ├─── "Tell me about Bitcoin" ───────► NO TOOL
    │                                          │
    │                                          ▼
    │                                     "Excuse me, I don't have
    │                                      information on this topic.
    │                                      Let's discuss weather! :)"
    │
    └─── "asdfghjkl" ───────────────────► NO TOOL
                                               │
                                               ▼
                                          "Sorry, I didn't understand.
                                           Could you repeat that?"
```

---

### 7. CLI → React Architecture

#### Full Shared Core Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 SHARED MASTRA CORE                          │
│                                                             │
│  /src/mastra/                                               │
│  ├── index.ts        (Mastra instance)                      │
│  ├── agents/                                                │
│  │   └── weatherAgent.ts    (agent config + persona)        │
│  └── tools/                                                 │
│      ├── getCurrentWeather.ts                               │
│      ├── setDefaultCity.ts                                  │
│      ├── setPreferredUnits.ts                               │
│      └── convertTemperature.ts                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │                           │
          ▼                           ▼
┌──────────────────┐        ┌──────────────────────┐
│   CLI INTERFACE  │        │   REACT INTERFACE    │
│                  │        │                      │
│  /src/cli/       │        │  /src/ui/  (React)   │
│  └── index.ts    │        │  ├── App.tsx         │
│                  │        │  ├── components/     │
│  • readline      │        │  │   └── Chat.tsx    │
│  • No icons      │        │  └── api/            │
│  • Text only     │        │      └── agent.ts    │
│                  │        │                      │
│                  │        │  • Streaming UI      │
│                  │        │  • Weather icons     │
│                  │        │  • Rich formatting   │
└──────────────────┘        └──────────────────────┘
```

#### Shared Core Pattern - Project Structure
```
mastra-weather-agent/
├── src/
│   ├── mastra/                    # SHARED CORE
│   │   ├── index.ts               # Mastra instance
│   │   ├── agents/
│   │   │   └── weatherAgent.ts    # Agent config + persona
│   │   └── tools/
│   │       ├── getCurrentWeather.ts
│   │       ├── setDefaultCity.ts
│   │       ├── setPreferredUnits.ts
│   │       └── convertTemperature.ts
│   │
│   ├── cli/                       # CLI INTERFACE
│   │   └── index.ts               # readline loop
│   │
│   └── ui/                        # REACT INTERFACE
│       ├── App.tsx                # Main React app
│       ├── components/
│       │   └── Chat.tsx           # Chat component
│       └── api/
│           └── agent.ts           # Agent API integration
│
├── .env                           # API keys (Gemini, OpenWeatherMap)
├── package.json
└── tsconfig.json
```

#### Interface Comparison
| Aspect | CLI (Phase 1) | React (Phase 2) |
|--------|---------------|-----------------|
| Input | Node.js `readline` | Chat input component |
| Output | Text only | Rich formatting + icons |
| Icons | Not used | Weather icons displayed |
| Streaming | Console output | Real-time token UI |

---

## Summary of Decisions

| Decision | Choice |
|----------|--------|
| **Model** | Google Gemini 2.5 Flash |
| **Workflows** | Not needed - agent + tools sufficient |
| **Tools** | 4: `getCurrentWeather`, `setDefaultCity`, `setPreferredUnits`, `convertTemperature` |
| **Working Memory** | `default_city`, `preferred_units`, `user_name` |
| **Conversation History** | Previous queries (enables follow-ups) |
| **CLI Input** | Node.js `readline` |
| **Architecture** | Shared Mastra core, separate CLI and React interfaces |
| **Weather API** | OpenWeatherMap |

---

## Next Steps

1. **Create PRD** - Document detailed requirements based on these decisions
2. **Define Agent Persona** - Explore personality traits (consider Role Playing technique)
3. **Implement CLI** - Build the readline-based CLI interface first
4. **Add React UI** - Extend with streaming chat interface

---

_Session facilitated using Decision Tree Mapping technique from BMad Brainstorming Workflow_
