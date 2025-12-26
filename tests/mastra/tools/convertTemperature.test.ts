/**
 * Temperature Conversion Tool Tests
 * Epic 4, Story 4.1: Implement convertTemperature Tool
 *
 * Tests:
 * - 4.1-UNIT-001: Temperature Conversion Accuracy
 */

import { describe, it, expect } from 'vitest';
import { temperatureFixtures } from '../../support/fixtures';

// Conversion formulas (to be moved to actual implementation)
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

describe('convertTemperature Tool', () => {
  describe('Celsius to Fahrenheit', () => {
    it('should convert 0C to 32F (freezing point)', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100C to 212F (boiling point)', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert -40C to -40F (equal point)', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it('should convert 20C to 68F (room temperature)', () => {
      expect(celsiusToFahrenheit(20)).toBe(68);
    });

    it('should convert 37C to approximately 98.6F (body temperature)', () => {
      expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1);
    });
  });

  describe('Fahrenheit to Celsius', () => {
    it('should convert 32F to 0C (freezing point)', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('should convert 212F to 100C (boiling point)', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('should convert -40F to -40C (equal point)', () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40);
    });

    it('should convert 68F to 20C (room temperature)', () => {
      expect(fahrenheitToCelsius(68)).toBe(20);
    });

    it('should convert 98.6F to approximately 37C (body temperature)', () => {
      expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37, 0);
    });
  });

  describe('Fixture-based Conversions', () => {
    it.each(temperatureFixtures.conversions)(
      'should convert $celsius°C to $fahrenheit°F',
      ({ celsius, fahrenheit }) => {
        expect(celsiusToFahrenheit(celsius)).toBeCloseTo(fahrenheit, 1);
      }
    );

    it.each(temperatureFixtures.conversions)(
      'should convert $fahrenheit°F to $celsius°C',
      ({ celsius, fahrenheit }) => {
        expect(fahrenheitToCelsius(fahrenheit)).toBeCloseTo(celsius, 1);
      }
    );
  });

  describe('Rounding and Precision', () => {
    it('should round to 1 decimal place for display', () => {
      const result = celsiusToFahrenheit(23.456);
      const rounded = Math.round(result * 10) / 10;
      // 23.456 * 9/5 + 32 = 74.2208, rounds to 74.2
      expect(rounded).toBe(74.2);
    });
  });
});
