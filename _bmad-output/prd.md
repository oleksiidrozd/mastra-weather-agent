---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - 'docs/context/product_brief.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-25.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'mastra-weather-agent'
user_name: 'Oleksii'
date: '2025-12-25'
---

# Product Requirements Document - mastra-weather-agent

**Author:** Oleksii
**Date:** 2025-12-25

## Executive Summary

**Mastra Weather Agent** is a chat demo application that showcases the Mastra AI Agent Framework through a practical, weather-focused assistant. The project serves as a hands-on learning vehicle for mastering core AI agent concepts: memory persistence, real-time streaming, tool execution, and persona definition.

The agent provides current weather information with a defined personality, remembering user preferences (default city, temperature units) across conversations while demonstrating predictable, well-structured behavior through decision tree-mapped response flows.

### What Makes This Special

This demo validates understanding of 4 core Mastra concepts in a single cohesive application:

1. **Memory Architecture** - Working memory persists user preferences across conversations; conversation history enables contextual follow-ups
2. **Tool Execution** - 4 purpose-built tools (getCurrentWeather, setDefaultCity, setPreferredUnits, convertTemperature) with clear input/output schemas
3. **Streaming** - Real-time token-by-token responses for natural conversational flow
4. **Persona** - Precise, memorable communication style with defined edge case handling

The shared core pattern enables a phased CLI → React evolution, proving the architecture works across interface boundaries.

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | CLI Tool → Web App (phased) |
| **Domain** | General (developer learning demo) |
| **Complexity** | Low |
| **Project Context** | Greenfield - new project |

**Tech Stack:** Mastra AI Framework, Google Gemini 2.5 Flash, OpenWeatherMap API, Node.js, React (Phase 2)

## Success Criteria

### User Success

**Developer (Primary User):**
- Successfully implement all 4 core Mastra concepts (memory, streaming, tools, personas)
- Understand *why* each concept works, not just *how*
- Be able to explain architecture decisions to others
- Have a working reference implementation to build upon

**Demo Viewer (Secondary User):**
- Experience a responsive, natural-feeling chat interaction
- Observe memory persistence across messages in real-time
- Witness tool execution flow (weather queries, preference updates)

### Business Success

- Demonstrable proficiency with Mastra framework for team contribution
- Clean, understandable codebase that serves as a learning reference
- Working demo that showcases all acceptance criteria from product brief

### Technical Success

- Mastra Memory with LibSQL storage adapter (persistent, not in-memory)
- All 4 tools with proper `inputSchema`, `outputSchema`, and `description`
- `maxSteps: 3` configured and documented (classify → tool call → respond)
- Error handling for tool failures and OpenWeatherMap API issues
- Streaming responses working correctly in CLI
- Shared core pattern validated (same agent works for CLI and React)

### Measurable Outcomes

| Metric | Target |
|--------|--------|
| Core concepts demonstrated | 4/4 (memory, streaming, tools, personas) |
| Acceptance criteria met | All functional + technical requirements |
| Agent behavior predictability | Follows decision tree mapping |
| Memory persistence | Preferences survive across conversation turns |

## Product Scope

### MVP - Minimum Viable Product

- CLI chat interface using Node.js readline
- 4 tools: `getCurrentWeather`, `setDefaultCity`, `setPreferredUnits`, `convertTemperature`
- Working memory: `default_city`, `preferred_units`, `user_name`
- Conversation history for contextual follow-ups
- Streaming responses (token-by-token output)
- Defined persona with edge case handling
- OpenWeatherMap API integration
- LibSQL storage adapter for memory persistence

### Growth Features (Post-MVP)

- React UI with streaming chat component
- Weather icons display
- Rich formatting and visual improvements
- Session management UI (new session button)
- Enhanced error states and loading indicators

### Vision (Future)

- Additional tools (forecast, weather alerts)
- Semantic recall for long-term memory
- Multi-agent capabilities
- Voice input/output

## User Journeys

### Journey 1: Weather Query (Happy Path)

**Oleksii's Morning Weather Check**

Oleksii opens his terminal and starts the weather agent CLI. It's a chilly December morning in Kyiv, and he wants to know if he needs a heavier coat before heading out.

"What's the weather?" he types.

The agent, remembering his default city from a previous session, immediately responds with streaming text: *"Hey Oleksii, as of this morning, the weather in Kyiv is partly cloudy at 2°C with 78% humidity. Bundle up, it's cold out there!"*

Later that day, Oleksii is planning a trip to Paris. He asks, "What's the weather in Paris?" The agent calls the weather tool with the new city and streams back: *"In Paris right now, it's 8°C with light rain. Don't forget your umbrella!"*

"What's that in Fahrenheit?" Oleksii asks. The agent converts the temperature seamlessly: *"That's about 46°F."*

### Journey 2: Preference Updates

**Setting Up for Convenience**

Oleksii realizes he'll be asking about Paris weather frequently during his trip planning. Instead of typing "Paris" every time, he tells the agent: "I'm in Paris now."

The agent calls `setDefaultCity`, updates working memory, and confirms: *"Got it! I'll use Paris as your default city from now on."*

Next time Oleksii asks "What's the weather?", the agent automatically queries Paris - proving memory persistence works across conversation turns.

### Journey 3: Edge Cases & Recovery

**When Things Get Weird**

Oleksii decides to test the agent's boundaries. He types: "Tell me about Bitcoin."

The agent politely redirects: *"Excuse me, I don't have information on this topic. Let's discuss weather instead! :)"*

He tries gibberish: "asdfghjkl"

The agent handles gracefully: *"Sorry, I didn't understand your question. Could you repeat that?"*

Finally, he asks about a vague location: "What's the weather in Springfield?" (there are dozens of Springfields). The agent asks for clarification: *"Which Springfield did you mean? Could you add the state or country?"*

### Journey Requirements Summary

| Journey | Capabilities Required |
|---------|----------------------|
| Weather Query | `getCurrentWeather` tool, working memory (default city), streaming responses, persona formatting |
| Preference Updates | `setDefaultCity`, `setPreferredUnits` tools, working memory persistence, confirmation responses |
| Edge Cases | Intent classification, graceful error messages, clarification prompts, off-topic redirection |
| Temperature Conversion | `convertTemperature` tool, conversation history (context from previous message) |

## CLI Tool Specific Requirements

### Project-Type Overview

This is an **interactive CLI chat application** built with Node.js readline. The agent operates in a conversational loop, processing natural language input and streaming responses in real-time. Unlike scriptable CLI tools, this focuses on human-agent dialogue rather than automated pipelines.

### Command Structure

| Aspect | Implementation |
|--------|----------------|
| **Interface** | Interactive readline loop (not command-based) |
| **Input** | Natural language messages |
| **Exit** | Type "exit", "quit", or Ctrl+C |
| **Session** | Continuous until user exits or requests new session |

**No traditional CLI commands** - the agent interprets all input as conversational messages and routes based on intent classification.

### Output Formats

| Format | Usage |
|--------|-------|
| **Text** | Primary - streaming conversational responses |
| **Structured** | Not required for demo |

Output is human-readable text only. The agent streams tokens to console as they're generated, providing real-time feedback.

### Configuration Schema

| Config Type | Method | Contents |
|-------------|--------|----------|
| **Environment** | `.env` file | `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENWEATHERMAP_API_KEY` |
| **Runtime** | Working Memory | `default_city`, `preferred_units`, `user_name` |
| **Agent** | Code | Persona, tool definitions, maxSteps |

No external config files needed. API keys via environment, user preferences via Mastra working memory.

### Implementation Considerations

- **Streaming Output:** Use Mastra's `stream()` method with console write for token-by-token display
- **Graceful Shutdown:** Handle SIGINT (Ctrl+C) to close readline and storage connections
- **Error Display:** Show user-friendly error messages, not stack traces
- **No Shell Completion:** Not applicable for conversational interface

## Functional Requirements

### Core Agent Capabilities

- **FR1:** User can send natural language messages to the agent via CLI
- **FR2:** Agent can respond with streaming text output (token-by-token)
- **FR3:** Agent can classify user intent (weather query, preference update, greeting, off-topic, unclear)
- **FR4:** Agent can maintain a defined persona in all responses

### Weather Information

- **FR5:** User can request current weather for a specific city
- **FR6:** User can request current weather without specifying city (uses default)
- **FR7:** Agent can retrieve real-time weather data from OpenWeatherMap API
- **FR8:** Agent can format weather information with temperature, conditions, and humidity
- **FR9:** Agent can include contextual advice in weather responses (e.g., "bring an umbrella")

### Temperature Conversion

- **FR10:** User can request temperature conversion from Celsius to Fahrenheit
- **FR11:** User can request temperature conversion from Fahrenheit to Celsius
- **FR12:** Agent can use conversation context to understand which temperature to convert

### Preference Management

- **FR13:** User can set a default city for weather queries
- **FR14:** User can set preferred temperature units (Celsius/Fahrenheit)
- **FR15:** Agent can persist user preferences across conversation turns
- **FR16:** Agent can persist user preferences across sessions (restart CLI)
- **FR17:** Agent can confirm preference changes to the user

### Session Management

- **FR18:** User can start a new conversation session
- **FR19:** User can exit the CLI application
- **FR20:** Agent can greet returning users by name (from working memory)

### Error Handling & Edge Cases

- **FR21:** Agent can handle off-topic requests with polite redirection
- **FR22:** Agent can handle unclear/gibberish input gracefully
- **FR23:** Agent can request clarification for ambiguous locations
- **FR24:** Agent can handle API failures with user-friendly error messages
- **FR25:** Agent can handle missing API keys with clear error messages

## Non-Functional Requirements

### Performance

- **NFR1:** Agent streaming response should begin within 2 seconds of user input
- **NFR2:** Weather API calls should complete within 5 seconds
- **NFR3:** Working memory reads/writes should complete within 100ms
- **NFR4:** CLI should remain responsive during streaming (no blocking)

### Security

- **NFR5:** API keys must be stored in environment variables, never in code
- **NFR6:** API keys must not be logged or displayed to users
- **NFR7:** `.env` file must be gitignored

### Integration

- **NFR8:** System must handle OpenWeatherMap API rate limits gracefully
- **NFR9:** System must handle network connectivity failures with retry or clear error
- **NFR10:** System must work with OpenWeatherMap free tier (60 calls/minute limit)

### Reliability

- **NFR11:** CLI must not crash on malformed user input
- **NFR12:** CLI must handle graceful shutdown on Ctrl+C
- **NFR13:** Memory persistence must survive CLI restarts

