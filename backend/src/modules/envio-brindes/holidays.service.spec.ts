import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HolidaysService } from './holidays.service';

describe('HolidaysService', () => {
  let service: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolidaysService
      ],
    }).compile();

    service = module.get<HolidaysService>(HolidaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHolidaysForYear', () => {
    it('should return all holidays for 2025', () => {
      const holidays = service.getHolidaysForYear(2025);

      expect(holidays).toBeDefined();
      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);

      // Verificar alguns feriados fixos
      const holidayDates = holidays.map(h => h.date);
      expect(holidayDates).toContain('2025-01-01'); // Confraternização Universal
      expect(holidayDates).toContain('2025-04-21'); // Tiradentes
      expect(holidayDates).toContain('2025-09-07'); // Independência
      expect(holidayDates).toContain('2025-12-25'); // Natal
    });

    it('should include movable holidays for 2025', () => {
      const holidays = service.getHolidaysForYear(2025);
      const holidayDates = holidays.map(h => h.date);

      // Verificar feriados móveis de 2025
      expect(holidayDates).toContain('2025-03-03'); // Carnaval
      expect(holidayDates).toContain('2025-04-18'); // Sexta-feira Santa
      expect(holidayDates).toContain('2025-06-19'); // Corpus Christi
    });

    it('should return sorted holidays by date', () => {
      const holidays = service.getHolidaysForYear(2025);
      const dates = holidays.map(h => h.date);

      // Verificar se está ordenado
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] >= dates[i - 1]).toBe(true);
      }
    });
  });

  describe('isHoliday', () => {
    it('should return true for fixed holidays', () => {
      // Confraternização Universal
      expect(service.isHoliday(new Date('2025-01-01T00:00:00Z'))).toBe(true);

      // Tiradentes
      expect(service.isHoliday(new Date('2025-04-21T00:00:00Z'))).toBe(true);

      // Natal
      expect(service.isHoliday(new Date('2025-12-25T00:00:00Z'))).toBe(true);
    });

    it('should return true for movable holidays', () => {
      // Carnaval 2025
      expect(service.isHoliday(new Date('2025-03-03T00:00:00Z'))).toBe(true);

      // Sexta-feira Santa 2025
      expect(service.isHoliday(new Date('2025-04-18T00:00:00Z'))).toBe(true);

      // Corpus Christi 2025
      expect(service.isHoliday(new Date('2025-06-19T00:00:00Z'))).toBe(true);
    });

    it('should return false for non-holidays', () => {
      expect(service.isHoliday(new Date('2025-01-02T00:00:00Z'))).toBe(false);
      expect(service.isHoliday(new Date('2025-06-15T00:00:00Z'))).toBe(false);
      expect(service.isHoliday(new Date('2025-08-10T00:00:00Z'))).toBe(false);
    });

    it('should work correctly for different years', () => {
      // Carnaval varia por ano
      expect(service.isHoliday(new Date('2024-02-12T00:00:00Z'))).toBe(true); // Carnaval 2024
      expect(service.isHoliday(new Date('2025-03-03T00:00:00Z'))).toBe(true); // Carnaval 2025
      expect(service.isHoliday(new Date('2026-02-16T00:00:00Z'))).toBe(true); // Carnaval 2026
    });
  });

  describe('getHolidayName', () => {
    it('should return correct name for fixed holidays', () => {
      expect(service.getHolidayName(new Date('2025-01-01T00:00:00Z'))).toBe('Confraternização Universal');
      expect(service.getHolidayName(new Date('2025-04-21T00:00:00Z'))).toBe('Tiradentes');
      expect(service.getHolidayName(new Date('2025-12-25T00:00:00Z'))).toBe('Natal');
    });

    it('should return correct name for movable holidays', () => {
      expect(service.getHolidayName(new Date('2025-03-03T00:00:00Z'))).toBe('Carnaval');
      expect(service.getHolidayName(new Date('2025-04-18T00:00:00Z'))).toBe('Sexta-feira Santa');
      expect(service.getHolidayName(new Date('2025-06-19T00:00:00Z'))).toBe('Corpus Christi');
    });

    it('should return null for non-holidays', () => {
      expect(service.getHolidayName(new Date('2025-01-02T00:00:00Z'))).toBeNull();
      expect(service.getHolidayName(new Date('2025-06-15T00:00:00Z'))).toBeNull();
    });
  });

  describe('getUpcomingHolidays', () => {
    it('should return next 5 holidays from a given date', () => {
      const upcomingHolidays = service.getUpcomingHolidays(new Date('2025-01-15T00:00:00Z'), 5);

      expect(upcomingHolidays).toBeDefined();
      expect(upcomingHolidays.length).toBeLessThanOrEqual(5);

      // Todos devem ser posteriores a 15/01/2025
      upcomingHolidays.forEach(holiday => {
        expect(holiday.date >= '2025-01-15').toBe(true);
      });
    });

    it('should include holidays from next year if needed', () => {
      const upcomingHolidays = service.getUpcomingHolidays(new Date('2025-12-20T00:00:00Z'), 3);

      // Deve incluir Natal 2025 e feriados de 2026
      const dates = upcomingHolidays.map(h => h.date);
      expect(dates).toContain('2025-12-25');
      expect(upcomingHolidays.some(h => h.date.startsWith('2026'))).toBe(true);
    });
  });

  describe('countHolidaysBetween', () => {
    it('should count holidays between two dates correctly', () => {
      // Janeiro a Junho de 2025
      const count = service.countHolidaysBetween(
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-06-30T00:00:00Z')
      );

      expect(count).toBeGreaterThan(0);

      // Deve incluir: Confraternização, Carnaval (2 dias), Tiradentes,
      // Dia do Trabalho, Sexta Santa, Corpus Christi
      expect(count).toBeGreaterThanOrEqual(7);
    });

    it('should return 0 when no holidays exist in range', () => {
      const count = service.countHolidaysBetween(
        new Date('2025-01-02T00:00:00Z'),
        new Date('2025-01-10T00:00:00Z')
      );

      expect(count).toBe(0);
    });

    it('should work across multiple years', () => {
      const count = service.countHolidaysBetween(
        new Date('2024-12-01T00:00:00Z'),
        new Date('2025-01-31T00:00:00Z')
      );

      // Deve incluir Natal 2024 e Confraternização 2025
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Movable holidays', () => {
    it('should have correct dates for known years', () => {
      const holidays2024 = service.getHolidaysForYear(2024);
      const easter2024 = holidays2024.find(h => h.name === 'Páscoa');
      expect(easter2024?.date).toBe('2024-03-31');

      const holidays2025 = service.getHolidaysForYear(2025);
      const easter2025 = holidays2025.find(h => h.name === 'Páscoa');
      expect(easter2025?.date).toBe('2025-04-20');
    });

    it('should include correct movable holidays for 2025', () => {
      const holidays2025 = service.getHolidaysForYear(2025);

      // Sexta-feira Santa
      const sextaSanta = holidays2025.find(h => h.name === 'Sexta-feira Santa');
      expect(sextaSanta?.date).toBe('2025-04-18');

      // Corpus Christi
      const corpusChristi = holidays2025.find(h => h.name === 'Corpus Christi');
      expect(corpusChristi?.date).toBe('2025-06-19');
    });
  });
});
