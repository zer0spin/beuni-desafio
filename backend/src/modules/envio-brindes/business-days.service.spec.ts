import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BusinessDaysService } from './business-days.service';
import { HolidaysService } from './holidays.service';

describe('BusinessDaysService', () => {
  let service: BusinessDaysService;
  let holidaysService: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessDaysService,
        {
          provide: HolidaysService,
          useFactory: () => ({
            isHoliday: vi.fn((date) => {
              // Mock de feriados
              const dateStr = new Date(date).toISOString().split('T')[0];
              const holidays = [
                '2025-01-01', // Confraternização Universal
                '2025-03-03', // Carnaval
                '2025-03-04', // Carnaval
                '2025-04-18', // Sexta-feira Santa
                '2025-04-20', // Páscoa
                '2025-04-21', // Tiradentes
                '2025-06-19', // Corpus Christi
                '2025-12-25', // Natal
              ];
              return holidays.includes(dateStr);
            }),
            getHolidaysForYear: vi.fn((year) => {
              // Mock de feriados
              if (year === 2025) {
                return [
                  { date: '2025-01-01', name: 'Confraternização Universal', type: 'fixed' },
                  { date: '2025-03-03', name: 'Carnaval', type: 'movable' },
                  { date: '2025-03-04', name: 'Carnaval', type: 'movable' },
                  { date: '2025-04-18', name: 'Sexta-feira Santa', type: 'movable' },
                  { date: '2025-04-20', name: 'Páscoa', type: 'movable' },
                  { date: '2025-04-21', name: 'Tiradentes', type: 'fixed' },
                  { date: '2025-06-19', name: 'Corpus Christi', type: 'movable' },
                  { date: '2025-12-25', name: 'Natal', type: 'fixed' },
                ];
              }
              return [];
            }),
          }),
        },
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
      expect(service.isBusinessDay(new Date('2025-01-06T00:00:00Z'))).toBe(true);

      // Terça-feira, 07/01/2025
      expect(service.isBusinessDay(new Date('2025-01-07T00:00:00Z'))).toBe(true);

      // Quarta-feira, 08/01/2025
      expect(service.isBusinessDay(new Date('2025-01-08T00:00:00Z'))).toBe(true);

      // Quinta-feira, 09/01/2025
      expect(service.isBusinessDay(new Date('2025-01-09T00:00:00Z'))).toBe(true);

      // Sexta-feira, 10/01/2025
      expect(service.isBusinessDay(new Date('2025-01-10T00:00:00Z'))).toBe(true);
    });

    it('should return false for weekends', () => {
      // Sábado, 11/01/2025
      expect(service.isBusinessDay(new Date('2025-01-11T00:00:00Z'))).toBe(false);

      // Domingo, 12/01/2025
      expect(service.isBusinessDay(new Date('2025-01-12T00:00:00Z'))).toBe(false);
    });

    it('should return false for fixed holidays', () => {
      // Confraternização Universal - 01/01/2025 (Quarta-feira)
      expect(service.isBusinessDay(new Date('2025-01-01T00:00:00Z'))).toBe(false);

      // Tiradentes - 21/04/2025 (Segunda-feira)
      expect(service.isBusinessDay(new Date('2025-04-21T00:00:00Z'))).toBe(false);

      // Natal - 25/12/2025 (Quinta-feira)
      expect(service.isBusinessDay(new Date('2025-12-25T00:00:00Z'))).toBe(false);
    });

    it('should return false for movable holidays', () => {
      // Carnaval 2025 - 03/03/2025 (Segunda-feira)
      expect(service.isBusinessDay(new Date('2025-03-03T00:00:00Z'))).toBe(false);

      // Sexta-feira Santa 2025 - 18/04/2025
      expect(service.isBusinessDay(new Date('2025-04-18T00:00:00Z'))).toBe(false);

      // Corpus Christi 2025 - 19/06/2025 (Quinta-feira)
      expect(service.isBusinessDay(new Date('2025-06-19T00:00:00Z'))).toBe(false);
    });
  });

  describe('calculateBusinessDaysBefore', () => {
    it('should calculate 7 business days before a date correctly', () => {
      // Aniversário: 20/01/2025 (Segunda-feira)
      // 7 dias úteis antes: 09/01/2025 (Quinta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20T00:00:00Z'), 7);
      expect(result.getUTCDate()).toBe(9);
      expect(result.getUTCMonth()).toBe(0); // Janeiro = 0
      expect(result.getUTCFullYear()).toBe(2025);
    });

    it('should skip weekends when calculating business days', () => {
      // Aniversário: 13/01/2025 (Segunda-feira)
      // 7 dias úteis antes deve pular o fim de semana
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-13T00:00:00Z'), 7);

      // Deve ser 02/01/2025 (Quinta-feira), pulando o fim de semana 04-05/01
      expect(result.getUTCDate()).toBe(2);
      expect(result.getUTCMonth()).toBe(0);
    });

    it('should skip holidays when calculating business days', () => {
      // Aniversário: 10/01/2025 (Sexta-feira)
      // Deve pular o feriado de Confraternização (01/01/2025)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-10T00:00:00Z'), 7);

      // Como 01/01 é feriado (quarta), deve voltar mais um dia
      expect(result.getUTCDate()).toBe(31); // 31/12/2024 (Terça-feira)
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCFullYear()).toBe(2024);
    });

    it('should handle calculation across months', () => {
      // Aniversário: 07/02/2025 (Sexta-feira)
      // 7 dias úteis antes deve voltar para Janeiro
      const result = service.calculateBusinessDaysBefore(new Date('2025-02-07T00:00:00Z'), 7);

      expect(result.getUTCMonth()).toBe(0); // Janeiro
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCDate()).toBe(29);
    });

    it('should handle multiple holidays in sequence (Carnaval)', () => {
      // Aniversário: 14/03/2025 (Sexta-feira)
      // 7 dias úteis antes deve pular Carnaval (03 e 04/03)
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-14T00:00:00Z'), 7);

      // Deve ser 05/03/2025 (Quarta-feira de cinzas, dia útil)
      expect(result.getUTCDate()).toBe(5);
      expect(result.getUTCMonth()).toBe(2); // Março
    });

    it('should calculate 1 business day before correctly', () => {
      // Aniversário: 06/01/2025 (Segunda-feira)
      // 1 dia útil antes: 03/01/2025 (Sexta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-06T00:00:00Z'), 1);

      expect(result.getUTCDate()).toBe(3);
      expect(result.getUTCMonth()).toBe(0);
    });

    it('should calculate 10 business days before correctly', () => {
      // Aniversário: 20/01/2025 (Segunda-feira)
      // 10 dias úteis antes
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20T00:00:00Z'), 10);

      // Deve pular 2 fins de semana e o feriado de 01/01
      expect(result.getUTCDate()).toBe(6);
      expect(result.getUTCMonth()).toBe(0);
    });
  });

  describe('countBusinessDaysBetween', () => {
    it('should count business days correctly in a week', () => {
      // De Segunda (06/01) até Sexta (10/01) = 5 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06T00:00:00Z'),
        new Date('2025-01-10T00:00:00Z')
      );
      expect(count).toBe(5);
    });

    it('should exclude weekends from count', () => {
      // De Segunda (06/01) até Segunda seguinte (13/01) = 6 dias úteis
      // (exclui sábado e domingo)
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06T00:00:00Z'),
        new Date('2025-01-13T00:00:00Z')
      );
      expect(count).toBe(6);
    });

    it('should exclude holidays from count', () => {
      // De 30/12/2024 até 03/01/2025
      // Exclui: 01/01 (feriado)
      // Dias úteis: 30/12, 31/12, 02/01, 03/01
      const count = service.countBusinessDaysBetween(
        new Date('2024-12-30T00:00:00Z'),
        new Date('2025-01-03T00:00:00Z')
      );

      expect(count).toBe(4);
    });

    it('should return 1 for same day if it is a business day', () => {
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06T00:00:00Z'),
        new Date('2025-01-06T00:00:00Z')
      );
      expect(count).toBe(1); // O dia atual conta
    });

    it('should handle range with only weekends', () => {
      // De Sábado (11/01) até Domingo (12/01) = 0 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-11T00:00:00Z'),
        new Date('2025-01-12T00:00:00Z')
      );
      expect(count).toBe(0);
    });
  });

  describe('getHolidaysForYear', () => {
    it('should return all holidays for a year', () => {
      const holidays = service.getHolidaysForYear(2025);

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);

      // Verificar formato de data
      holidays.forEach(holiday => {
        expect(holiday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should include both fixed and movable holidays', () => {
      const holidays = service.getHolidaysForYear(2025);

      // Feriados fixos
      expect(holidays).toContain('2025-01-01');
      expect(holidays).toContain('2025-12-25');

      // Feriados móveis
      expect(holidays).toContain('2025-03-03'); // Carnaval
      expect(holidays).toContain('2025-04-18'); // Sexta Santa
    });
  });

  describe('Real-world scenarios', () => {
    it('should correctly calculate trigger date for birthday on Monday', () => {
      // Cenário: Aniversário na segunda-feira, 13/01/2025
      // 7 dias úteis antes = 02/01/2025 (quinta-feira)
      // Pulando fim de semana 04-05/01 e feriado 01/01
      const birthdayDate = new Date('2025-01-13T00:00:00Z');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(service.isBusinessDay(triggerDate)).toBe(true);
      expect(triggerDate.getUTCDate()).toBe(2);
    });

    it('should correctly calculate trigger date for birthday after Carnaval', () => {
      // Cenário: Aniversário em 14/03/2025 (sexta)
      // 7 dias úteis antes deve pular Carnaval (03 e 04/03)
      const birthdayDate = new Date('2025-03-14T00:00:00Z');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(service.isBusinessDay(triggerDate)).toBe(true);

      // Contar dias úteis entre trigger e aniversário deve ser exatamente 7
      const businessDaysCount = service.countBusinessDaysBetween(
        triggerDate,
        new Date('2025-03-13T00:00:00Z') // um dia antes do aniversário
      );
      expect(businessDaysCount).toBe(7);
    });

    it('should correctly calculate trigger date near year end', () => {
      // Cenário: Aniversário em 02/01/2025 (quinta-feira)
      // 7 dias úteis antes deve voltar para 2024
      const birthdayDate = new Date('2025-01-02T00:00:00Z');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(triggerDate.getUTCFullYear()).toBe(2024);
      expect(service.isBusinessDay(triggerDate)).toBe(true);
      expect(triggerDate.getUTCDate()).toBe(23); // 23/12/2024 (segunda)
    });
  });
});
