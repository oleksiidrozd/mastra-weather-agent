# Agent Memory

Agents use memory to maintain context across interactions. LLMs are stateless and don't retain information between calls, so agents need memory to track conversation history and recall relevant information.

Mastra agents can be configured to store conversation history, with optional [working memory](https://mastra.ai/docs/memory/working-memory) to maintain recent context or [semantic recall](https://mastra.ai/docs/memory/semantic-recall) to retrieve past messages based on meaning.

## When to use memory

Use memory when your agent needs to maintain multi-turn conversations that reference prior exchanges, recall user preferences or facts from earlier in a session, or build context over time within a conversation thread. Skip memory for single-turn requests where each interaction is independent.

## Setting up memory

To enable memory in Mastra, install the `@mastra/memory` package along with a storage provider.

```bash
npm install @mastra/memory@latest @mastra/libsql@latest
```

## Storage providers

Memory requires a storage provider to persist conversation history, including user messages and agent responses. For more details on available providers and how storage works in Mastra, see the [Storage](https://mastra.ai/docs/server-db/storage) documentation.

## Configuring memory

1. Enable memory by creating a `Memory` instance and passing it to the agent's `memory` option.

**src/mastra/agents/memory-agent.ts**
```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

export const memoryAgent = new Agent({
  // ...
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
```

> **Note:** See the [Memory Class](https://mastra.ai/reference/memory/memory-class) docs for a full list of configuration options.

2. Add a storage provider to your main Mastra instance to enable memory across all configured agents.

**src/mastra/index.ts**
```typescript
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

export const mastra = new Mastra({
  // ..
  storage: new LibSQLStore({
    url: ":memory:",
  }),
});
```

> **Note:** See the [LibSQL Storage](https://mastra.ai/reference/storage/libsql) docs for a full list of configuration options.

Alternatively, add storage directly to an agent's memory to keep data separate or use different providers per agent.

**src/mastra/agents/memory-agent.ts**
```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const memoryAgent = new Agent({
  // ...
  memory: new Memory({
    storage: new LibSQLStore({
      url: ":memory:",
    }),
  }),
});
```

## Conversation history

Include a `memory` object with both `resource` and `thread` to track conversation history during agent calls.

- `resource`: A stable identifier for the user or entity.
- `thread`: An ID that isolates a specific conversation or session.

These fields tell the agent where to store and retrieve context, enabling persistent, thread-aware memory across a conversation.

```typescript
const response = await memoryAgent.generate(
  "Remember my favorite color is blue.",
  {
    memory: {
      thread: "user-123",
      resource: "test-123",
    },
  },
);
```

To recall information stored in memory, call the agent with the same `resource` and `thread` values used in the original conversation.

```typescript
const response = await memoryAgent.generate("What's my favorite color?", {
  memory: {
    thread: "user-123",
    resource: "test-123",
  },
});
```

To learn more about memory see the [Memory](https://mastra.ai/docs/memory/overview) documentation.

## Using `RuntimeContext`

Use [RuntimeContext](https://mastra.ai/docs/server-db/runtime-context) to access request-specific values. This lets you conditionally select different memory or storage configurations based on the context of the request.

**src/mastra/agents/memory-agent.ts**
```typescript
export type UserTier = {
  "user-tier": "enterprise" | "pro";
};

const premiumMemory = new Memory({
  // ...
});

const standardMemory = new Memory({
  // ...
});

export const memoryAgent = new Agent({
  // ...
  memory: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier") as UserTier["user-tier"];

    return userTier === "enterprise" ? premiumMemory : standardMemory;
  },
});
```

> **Note:** See [Runtime Context](https://mastra.ai/docs/server-db/runtime-context) docs for more information.

## Related

- [Working Memory](https://mastra.ai/docs/memory/working-memory)
- [Semantic Recall](https://mastra.ai/docs/memory/semantic-recall)
- [Threads and Resources](https://mastra.ai/docs/memory/threads-and-resources)
- [Runtime Context](https://mastra.ai/docs/server-db/runtime-context)