# Product Brief: Mastra AI Agent Demo

## Overview

A working chat demo application showcasing the Mastra AI Agent Framework, demonstrating proficiency in core AI agent concepts including memory, streaming, tools, and personas.

---

## Goal / User Story

**As a** developer joining the team,  
**I want to** learn and demonstrate proficiency with the Mastra AI Agent Framework,  
**So that** I can contribute to AI agent development and show understanding of core concepts like memory, streaming, tools, and personas.

**Deliverable:** Working chat demo app with Mastra AI agent that showcases all key framework capabilities.

---

## Problem & Context

### Why This Matters

- Mastra is the target framework for AI agent development
- Learning by building > just reading docs
- This demo validates understanding of 4 core concepts

### Required Reading (Mastra Docs)

1. **Agents** — what they are, how to configure
2. **Workflows** — orchestrating multi-step processes
3. **Memory** — conversation persistence, context management
4. **Streaming** — real-time token-by-token responses

### Tech Stack

- **Runtime:** Node.js
- **Framework:** Mastra AI Agent
- **Frontend:** Any minimal solution (CLI, basic HTML, or simple React/Next.js)

---

## Key Concepts to Master

### 1. Agent Decision Making

- How does the agent decide: respond with text or call a tool?
- Role of `description` in tool definition
- What is `maxSteps` and why it matters (infinite loops prevention, token management)

### 2. Memory Architecture

| Type | What It Stores | Persistence |
|------|----------------|-------------|
| Working Memory | User preferences, goals, structured data | Cross-conversation |
| Conversation History | Recent messages in current thread | Thread-scoped |
| Semantic Recall | Relevant old messages via vector search | Configurable |

### 3. Tool Execution Flow

```
User message → Agent analyzes → Matches tool by description/schema
→ Extracts params from message → Executes tool → Returns to agent → Continues reasoning
```

### 4. Streaming Mechanics

- `generate()` — wait for full response, then return
- `stream()` — tokens delivered real-time
- How does this work when agent calls a tool mid-stream?

### 5. Context Window Management

- What happens when conversation exceeds model's limit?
- Memory processors for trimming

---

## Reference Documentation

| Topic | Doc Path |
|-------|----------|
| Agents | /Users/mwdn/mastra-weather-agent/docs/mastra-ai/agents |
| Memory |  /Users/mwdn/mastra-weather-agent/docs/mastra-ai/memory |
| Streaming | /Users/mwdn/mastra-weather-agent/docs/mastra-ai/streaming |
| Workflows | /Users/mwdn/mastra-weather-agent/docs/mastra-ai/workflows |

---

## Acceptance Criteria

### Functional Requirements

- [ ] Chat interface where user can send messages and see conversation
- [ ] Streaming responses (tokens appear in real-time, not all at once)
- [ ] Memory persists across messages in same session
- [ ] New session can be started (via button OR by asking the agent)
- [ ] At least 1 custom Tool implemented (e.g., read file, get weather, calculate)
- [ ] Agent has a defined Persona (fun/memorable personality)

### Technical Requirements

- [ ] Uses Mastra Memory with storage adapter (not just in-memory)
- [ ] Tool has proper `inputSchema`, `outputSchema`, `description`
- [ ] `maxSteps` configured with reasoning for that value
- [ ] Error handling for tool failures

---

## Success Metrics

1. Demo showcases all 4 core Mastra concepts
2. Code is clean and demonstrates understanding of framework patterns
3. Agent behavior is predictable and well-defined
4. Memory persists correctly across conversation turns