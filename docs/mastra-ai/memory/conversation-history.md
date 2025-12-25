# Conversation History

Conversation history is the simplest kind of memory. It is a list of messages from the current conversation.

By default, each request includes the last 10 messages from the current memory thread, giving the agent short-term conversational context. This limit can be increased using the `lastMessages` parameter.

You can increase this limit by passing the `lastMessages` parameter to the `Memory` instance.

```typescript
export const testAgent = new Agent({
  // ...
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
```