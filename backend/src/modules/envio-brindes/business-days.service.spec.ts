import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessDaysService } from './business-days.service';
import { HolidaysService } from './holidays.service';

describe('BusinessDaysService', () => {
  let service: BusinessDaysService;
  let holidaysService: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessDaysService,
        HolidaysService,
      ],
    }).compile();

    service = module.get<BusinessDaysService>(BusinessDaysService);
    holidaysService = module.get<HolidaysService>(HolidaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isBusinessDay', () => {
    it('should return true for regular weekdays', () => {
      // Segunda-feira, 06/01/2025
      expect(service.isBusinessDay(new Date('2025-01-06'))).toBe(true);

      // Terça-feira, 07/01/2025
      expect(service.isBusinessDay(new Date('2025-01-07'))).toBe(true);

      // Quarta-feira, 08/01/2025
      expect(service.isBusinessDay(new Date('2025-01-08'))).toBe(true);
    });

    it('should return false for weekends', () => {
      // Sábado, 04/01/2025
      expect(service.isBusinessDay(new Date('2025-01-04'))).toBe(false);

      // Domingo, 05/01/2025
      expect(service.isBusinessDay(new Date('2025-01-05'))).toBe(false);
    });

    it('should return false for fixed holidays', () => {
      // Confraternização Universal (01/01/2025)
      expect(service.isBusinessDay(new Date('2025-01-01'))).toBe(false);

      // Tiradentes (21/04/2025)
      expect(service.isBusinessDay(new Date('2025-04-21'))).toBe(false);

      // Natal (25/12/2025)
      expect(service.isBusinessDay(new Date('2025-12-25'))).toBe(false);
    });

    it('should return false for movable holidays', () => {
      // Carnaval 2025 (03/03/2025)
      expect(service.isBusinessDay(new Date('2025-03-03'))).toBe(false);

      // Sexta-feira Santa 2025 (18/04/2025)
      expect(service.isBusinessDay(new Date('2025-04-18'))).toBe(false);
    });
  });

  describe('calculateBusinessDaysBefore', () => {
    it('should calculate 7 business days before a date correctly', () => {
      // 20/01/2025 é uma segunda-feira
      // 7 dias úteis antes = 09/01/2025 (quinta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20'), 7);
      expect(result.getDate()).toBe(9);
      expect(result.getMonth()).toBe(0); // Janeiro
    });

    it('should skip weekends when calculating business days', () => {
      // 13/01/2025 é uma segunda-feira
      // 7 dias úteis antes devem pular o fim de semana
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-13'), 7);
      expect(result.getDate()).toBe(2); // 02/01/2025
    });

    it('should skip holidays when calculating business days', () => {
      // 10/01/2025 é uma sexta-feira
      // 7 dias úteis antes, pulando 01/01 (feriado) = 02/01/2025
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-10'), 7);
      expect(result.getDate()).toBe(2);
    });

    it('should handle calculation across months', () => {
      // 05/02/2025
      // 7 dias úteis antes deve retornar uma data em janeiro
      const result = service.calculateBusinessDaysBefore(new Date('2025-02-05'), 7);
      expect(result.getMonth()).toBe(0); // Janeiro
    });

    it('should handle multiple holidays in sequence (Carnaval)', () => {
      // 10/03/2025 é uma segunda-feira
      // Deve pular o Carnaval (03 e 04 de março)
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-10'), 7);
      expect(result.getDate()).toBe(27); // 27/02/2025
    });

    it('should calculate 1 business day before correctly', () => {
      // Segunda-feira 06/01/2025
      // 1 dia útil antes = sexta-feira 03/01/2025
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-06'), 1);
      expect(result.getDate()).toBe(3);
    });

    it('should calculate 10 business days before correctly', () => {
      // 27/01/2025 é uma segunda-feira
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-27'), 10);
      expect(result.getDate()).toBe(13); // 13/01/2025
    });
  });

  describe('countBusinessDaysBetween', () => {
    it('should count business days correctly in a week', () => {
      // De segunda (06/01) a sexta (10/01) = 5 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06'),
        new Date('2025-01-10')
      );
      expect(count).toBe(5);
    });

    it('should exclude weekends from count', () => {
      // De quinta (09/01) a segunda (13/01) = 3 dias úteis (qui, sex, seg)
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-09'),
        new Date('2025-01-13')
      );
      expect(count).toBe(3);
    });

    it('should exclude holidays from count', () => {
      // De 30/12/2024 a 03/01/2025
      // Pula 01/01 (feriado) e fins de semana
      const count = service.countBusinessDaysBetween(
        new Date('2024-12-30'),
        new Date('2025-01-03')
      );
      expect(count).toBe(3); // 30/12, 02/01, 03/01
    });

    it('should return 1 for same day if it is a business day', () => {
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06'),
        new Date('2025-01-06')
      );
      expect(count).toBe(1);
    });

    it('should handle range with only weekends', () => {
      // De sábado (04/01) a domingo (05/01) = 0 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-04'),
        new Date('2025-01-05')
      );
      expect(count).toBe(0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should correctly calculate trigger date for birthday on Monday', () => {
      // Aniversário em 20/01/2025 (segunda-feira)
      // 7 dias úteis antes = 09/01/2025
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20'), 7);
      expect(result.getDate()).toBe(9);
      expect(result.getMonth()).toBe(0);
    });

    it('should correctly calculate trigger date for birthday after Carnaval', () => {
      // Aniversário em 10/03/2025 (após Carnaval)
      // Deve pular o Carnaval nos cálculos
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-10'), 7);
      expect(result.getDate()).toBe(27); // 27/02/2025
      expect(result.getMonth()).toBe(1); // Fevereiro
    });

    it('should correctly calculate trigger date near year end', () => {
      // Aniversário em 02/01/2026
      // 7 dias úteis antes atravessa o ano
      const result = service.calculateBusinessDaysBefore(new Date('2026-01-02'), 7);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // Dezembro
    });
  });
});
