import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: weatherAdvice.njk template', () => {
  const env = getEnvironment()

  describe('AC #1, #2: tempAdvice macro with unit switching', () => {
    it('should show Celsius ranges when defaultUnit is celsius', () => {
      const result = env.render('weatherAdvice.njk', {
        ...defaultConfig,
        defaultUnit: 'celsius',
      })

      expect(result).toContain('Below 0°C')
      expect(result).toContain('0°C to 10°C')
      expect(result).toContain('10°C to 18°C')
      expect(result).toContain('18°C to 25°C')
      expect(result).toContain('25°C to 30°C')
      expect(result).toContain('Above 30°C')
    })

    it('should show Fahrenheit ranges when defaultUnit is fahrenheit', () => {
      const result = env.render('weatherAdvice.njk', {
        ...defaultConfig,
        defaultUnit: 'fahrenheit',
      })

      expect(result).toContain('Below 32°F')
      expect(result).toContain('32°F to 50°F')
      expect(result).toContain('50°F to 64°F')
      expect(result).toContain('64°F to 77°F')
      expect(result).toContain('77°F to 86°F')
      expect(result).toContain('Above 86°F')
    })

    it('should not show Fahrenheit ranges when defaultUnit is celsius', () => {
      const result = env.render('weatherAdvice.njk', {
        ...defaultConfig,
        defaultUnit: 'celsius',
      })

      expect(result).not.toContain('Below 32°F')
      expect(result).not.toContain('32°F to 50°F')
    })

    it('should not show Celsius ranges when defaultUnit is fahrenheit', () => {
      const result = env.render('weatherAdvice.njk', {
        ...defaultConfig,
        defaultUnit: 'fahrenheit',
      })

      expect(result).not.toContain('Below 0°C')
      expect(result).not.toContain('0°C to 10°C')
    })
  })

  describe('AC #3: Temperature ranges', () => {
    it('should include all temperature categories', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Freezing')
      expect(result).toContain('### Cold')
      expect(result).toContain('### Cool')
      expect(result).toContain('### Pleasant')
      expect(result).toContain('### Warm')
      expect(result).toContain('### Hot')
    })

    it('should include advice for each temperature range', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('below freezing')
      expect(result).toContain('Bundle up')
      expect(result).toContain('light jacket')
      expect(result).toContain('Perfect weather')
      expect(result).toContain('Stay hydrated')
    })
  })

  describe('AC #4: Precipitation advice', () => {
    it('should contain PRECIPITATION ADVICE header', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('## PRECIPITATION ADVICE')
    })

    it('should include rain advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Rain')
      expect(result).toContain('umbrella')
    })

    it('should include thunderstorm advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Thunderstorm')
      expect(result).toContain('stay indoors')
    })

    it('should include snow advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Snow')
      expect(result).toContain('slippery')
    })
  })

  describe('AC #5: Special conditions', () => {
    it('should contain SPECIAL CONDITIONS header', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('## SPECIAL CONDITIONS')
    })

    it('should include sunny/clear advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Sunny')
      expect(result).toContain('sunscreen')
    })

    it('should include windy advice with thresholds', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Windy')
      expect(result).toContain('20 km/h')
      expect(result).toContain('breezy')
    })

    it('should include humidity advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### High Humidity')
      expect(result).toContain('80%')
      expect(result).toContain('humid')
    })

    it('should include fog/mist advice', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('### Fog')
      expect(result).toContain('Visibility')
    })
  })

  describe('AC #6: Combining conditions', () => {
    it('should contain COMBINING CONDITIONS header', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('## COMBINING CONDITIONS')
    })

    it('should include common combinations', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('Cold + Rain')
      expect(result).toContain('Hot + Sunny')
      expect(result).toContain('Snow + Freezing')
      expect(result).toContain('Humid + Hot')
    })

    it('should include priority rules', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('Advice Priority')
      expect(result).toContain('Safety')
      expect(result).toContain('Precipitation')
    })

    it('should include advice placement guidance', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('Advice Placement')
      expect(result).toContain('END of the weather summary')
      expect(result).toContain('GOOD:')
      expect(result).toContain('BAD:')
    })
  })

  describe('Template structure', () => {
    it('should have all major sections', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
      expect(result).toContain('## TEMPERATURE ADVICE')
      expect(result).toContain('## PRECIPITATION ADVICE')
      expect(result).toContain('## SPECIAL CONDITIONS')
      expect(result).toContain('## COMBINING CONDITIONS')
    })

    it('should contain header for the section', () => {
      const result = env.render('weatherAdvice.njk', defaultConfig)

      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
    })
  })

  describe('Template independence', () => {
    it('should render with minimal config (defaults to celsius)', () => {
      const result = env.render('weatherAdvice.njk', {})

      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
      expect(result).toContain('Below 0°C')
    })

    it('should use celsius as default when no unit specified', () => {
      const result = env.render('weatherAdvice.njk', {
        agentName: 'TestBot',
      })

      expect(result).toContain('0°C to 10°C')
      expect(result).not.toContain('32°F to 50°F')
    })
  })
})
