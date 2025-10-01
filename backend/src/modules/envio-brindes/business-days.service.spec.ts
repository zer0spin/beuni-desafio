import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessDaysService } from './business-days.service';
import { HolidaysService } from './holidays.service';

describe('BusinessDaysService', () => {
  let service: BusinessDaysService;
  let holidaysService: HolidaysService;

  beforeEach(() => {
    // Instantiate services directly instead of using NestJS Test module
    // This avoids DI issues with Vitest
    holidaysService = new HolidaysService();
    service = new BusinessDaysService(holidaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isBusinessDay', () => {
    it('should return true for regular weekdays', () => {
      // Segunda-feira, 06/01/2025
      expect(service.isBusinessDay(new Date('2025-01-06T00:00:00Z'))).toBe(true);

      // Terça-feira, 07/01/2025
      expect(service.isBusinessDay(new Date('2025-01-07T00:00:00Z'))).toBe(true);

      // Quarta-feira, 08/01/2025
      expect(service.isBusinessDay(new Date('2025-01-08T00:00:00Z'))).toBe(true);
    });

    it('should return false for weekends', () => {
      // Sábado, 04/01/2025
      expect(service.isBusinessDay(new Date('2025-01-04T00:00:00Z'))).toBe(false);

      // Domingo, 05/01/2025
      expect(service.isBusinessDay(new Date('2025-01-05T00:00:00Z'))).toBe(false);
    });

    it('should return false for fixed holidays', () => {
      // Confraternização Universal (01/01/2025)
      expect(service.isBusinessDay(new Date('2025-01-01T00:00:00Z'))).toBe(false);

      // Tiradentes (21/04/2025)
      expect(service.isBusinessDay(new Date('2025-04-21T00:00:00Z'))).toBe(false);

      // Natal (25/12/2025)
      expect(service.isBusinessDay(new Date('2025-12-25T00:00:00Z'))).toBe(false);
    });

    it('should return false for movable holidays', () => {
      // Carnaval 2025 (03/03/2025)
      expect(service.isBusinessDay(new Date('2025-03-03T00:00:00Z'))).toBe(false);

      // Sexta-feira Santa 2025 (18/04/2025)
      expect(service.isBusinessDay(new Date('2025-04-18T00:00:00Z'))).toBe(false);
    });
  });

  describe('calculateBusinessDaysBefore', () => {
    it('should calculate 7 business days before a date correctly', () => {
      // 20/01/2025 é uma segunda-feira
      // 7 dias úteis antes = 09/01/2025 (quinta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(9);
      expect(result.getUTCMonth()).toBe(0); // Janeiro
    });

    it('should skip weekends when calculating business days', () => {
      // 13/01/2025 é uma segunda-feira
      // 7 dias úteis antes devem pular o fim de semana
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-13T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(2); // 02/01/2025
    });

    it('should skip holidays when calculating business days', () => {
      // 10/01/2025 é uma sexta-feira
      // 7 dias úteis antes, pulando 01/01 (feriado) e fim de semana = 31/12/2024
      // Contando: 9,8,7,6,3 (pula 4-5 fim de semana), 2 (pula 1 feriado), 31/12
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-10T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(31);
      expect(result.getUTCMonth()).toBe(11); // Dezembro
      expect(result.getUTCFullYear()).toBe(2024);
    });

    it('should handle calculation across months', () => {
      // 05/02/2025
      // 7 dias úteis antes deve retornar uma data em janeiro
      const result = service.calculateBusinessDaysBefore(new Date('2025-02-05T00:00:00Z'), 7);
      expect(result.getUTCMonth()).toBe(0); // Janeiro
    });

    it('should handle multiple holidays in sequence (Carnaval)', () => {
      // 10/03/2025 é uma segunda-feira
      // Deve pular o Carnaval (03 e 04 de março)
      // Contando: 7,6,5 (pula 4,3 Carnaval), 28,27,26,25
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-10T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(25); // 25/02/2025
    });

    it('should calculate 1 business day before correctly', () => {
      // Segunda-feira 06/01/2025
      // 1 dia útil antes = sexta-feira 03/01/2025
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-06T00:00:00Z'), 1);
      expect(result.getUTCDate()).toBe(3);
    });

    it('should calculate 10 business days before correctly', () => {
      // 27/01/2025 é uma segunda-feira
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-27T00:00:00Z'), 10);
      expect(result.getUTCDate()).toBe(13); // 13/01/2025
    });
  });

  describe('countBusinessDaysBetween', () => {
    it('should count business days correctly in a week', () => {
      // De segunda (06/01) a sexta (10/01) = 5 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06T00:00:00Z'),
        new Date('2025-01-10T00:00:00Z')
      );
      expect(count).toBe(5);
    });

    it('should exclude weekends from count', () => {
      // De quinta (09/01) a segunda (13/01) = 3 dias úteis (qui, sex, seg)
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-09T00:00:00Z'),
        new Date('2025-01-13T00:00:00Z')
      );
      expect(count).toBe(3);
    });

    it('should exclude holidays from count', () => {
      // De 30/12/2024 a 03/01/2025
      // Pula 01/01 (feriado) e fins de semana
      // 30/12 (Mon), 31/12 (Tue), pula 01/01 (feriado), 02/01 (Thu), 03/01 (Fri)
      const count = service.countBusinessDaysBetween(
        new Date('2024-12-30T00:00:00Z'),
        new Date('2025-01-03T00:00:00Z')
      );
      expect(count).toBe(4); // 30/12, 31/12, 02/01, 03/01
    });

    it('should return 1 for same day if it is a business day', () => {
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06T00:00:00Z'),
        new Date('2025-01-06T00:00:00Z')
      );
      expect(count).toBe(1);
    });

    it('should handle range with only weekends', () => {
      // De sábado (04/01) a domingo (05/01) = 0 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-04T00:00:00Z'),
        new Date('2025-01-05T00:00:00Z')
      );
      expect(count).toBe(0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should correctly calculate trigger date for birthday on Monday', () => {
      // Aniversário em 20/01/2025 (segunda-feira)
      // 7 dias úteis antes = 09/01/2025
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(9);
      expect(result.getUTCMonth()).toBe(0);
    });

    it('should correctly calculate trigger date for birthday after Carnaval', () => {
      // Aniversário em 10/03/2025 (após Carnaval)
      // Deve pular o Carnaval nos cálculos
      // Contando: 7,6,5 (pula 4,3 Carnaval), 28,27,26,25
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-10T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(25); // 25/02/2025
      expect(result.getUTCMonth()).toBe(1); // Fevereiro
    });

    it('should correctly calculate trigger date near year end', () => {
      // Aniversário em 02/01/2026
      // 7 dias úteis antes atravessa o ano
      const result = service.calculateBusinessDaysBefore(new Date('2026-01-02T00:00:00Z'), 7);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(11); // Dezembro
    });
  });
});
