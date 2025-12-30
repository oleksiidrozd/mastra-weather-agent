declare module 'nunjucks-markdown' {
  import { Environment } from 'nunjucks'
  export function register(env: Environment, renderer: unknown): void
}
