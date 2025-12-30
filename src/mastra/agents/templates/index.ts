import { fileURLToPath } from 'node:url'
import path from 'node:path'
import nunjucks from 'nunjucks'
import markdown from 'nunjucks-markdown'
import { marked } from 'marked'
import type { WeatherAgentConfig, PartialWeatherAgentConfig } from './types.js'
import { defaultConfig, mergeConfig } from './types.js'

// ESM path resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure Nunjucks environment
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(__dirname, {
    watch: false,
    noCache: process.env.NODE_ENV === 'development',
  }),
  {
    autoescape: false,    // We're generating text, not HTML
    trimBlocks: true,     // Remove first newline after block tags
    lstripBlocks: true,   // Strip leading whitespace from block tags
  }
)

// Register markdown extension
markdown.register(env, marked)

/**
 * Build the complete instructions string for the Weather Agent.
 *
 * @param config - Partial configuration to override defaults
 * @returns The rendered instructions string
 *
 * @example
 * // Use all defaults
 * const instructions = buildInstructions()
 *
 * @example
 * // Custom agent name
 * const instructions = buildInstructions({ agentName: 'Stormy' })
 */
export function buildInstructions(config?: PartialWeatherAgentConfig): string {
  const mergedConfig: WeatherAgentConfig = mergeConfig(config)
  return env.render('main.njk', mergedConfig)
}

/**
 * Get the configured Nunjucks environment for testing or advanced usage.
 * @returns The Nunjucks environment instance
 */
export function getEnvironment(): nunjucks.Environment {
  return env
}

// Re-export types for convenience
export type { WeatherAgentConfig, PartialWeatherAgentConfig } from './types.js'
export { defaultConfig, mergeConfig } from './types.js'
