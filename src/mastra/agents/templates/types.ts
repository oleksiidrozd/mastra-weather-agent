/**
 * Configuration for the Weather Agent's instruction templates.
 * All properties have sensible defaults - override only what you need.
 */
export interface WeatherAgentConfig {
  /** Display name for the agent (default: "Sunny") */
  agentName: string

  /** Role description used in persona (default: "weather information specialist") */
  agentRole: string

  /** Personality traits for conversation style (default: "Cheerful, conversational, weather-obsessed") */
  personality: string

  /** Default temperature unit for ranges in advice (default: "celsius") */
  defaultUnit: 'celsius' | 'fahrenheit'

  /** Optional custom greeting messages. If provided, replaces default greetings */
  greetings?: string[]

  /** Optional list of cities that need disambiguation (e.g., "Springfield") */
  ambiguousCities?: string[]
}

/**
 * Default configuration values for the Weather Agent.
 * Matches the current hardcoded values in weatherAgent.ts instructions.
 */
export const defaultConfig: WeatherAgentConfig = {
  agentName: 'Sunny',
  agentRole: 'weather information specialist',
  personality: 'Cheerful, conversational, weather-obsessed',
  defaultUnit: 'celsius',
  // greetings and ambiguousCities intentionally omitted - use defaults in templates
}

/**
 * Partial configuration type for overriding specific values.
 * Use with spread operator: { ...defaultConfig, ...partialConfig }
 */
export type PartialWeatherAgentConfig = Partial<WeatherAgentConfig>

/**
 * Merges a partial config with defaults to create a complete config.
 * @param partial - Optional partial configuration to merge
 * @returns Complete WeatherAgentConfig with all required fields
 */
export function mergeConfig(partial?: PartialWeatherAgentConfig): WeatherAgentConfig {
  return { ...defaultConfig, ...partial }
}
