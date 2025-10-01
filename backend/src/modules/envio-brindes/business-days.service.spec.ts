import { Test, TestingModule } from '@nestjs/testing';
import { BusinessDaysService } from './business-days.service';
import { HolidaysService } from './holidays.service';

describe('BusinessDaysService', () => {
  let service: BusinessDaysService;
  let holidaysService: HolidaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessDaysService, HolidaysService],
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

      // Quinta-feira, 09/01/2025
      expect(service.isBusinessDay(new Date('2025-01-09'))).toBe(true);

      // Sexta-feira, 10/01/2025
      expect(service.isBusinessDay(new Date('2025-01-10'))).toBe(true);
    });

    it('should return false for weekends', () => {
      // Sábado, 11/01/2025
      expect(service.isBusinessDay(new Date('2025-01-11'))).toBe(false);

      // Domingo, 12/01/2025
      expect(service.isBusinessDay(new Date('2025-01-12'))).toBe(false);
    });

    it('should return false for fixed holidays', () => {
      // Confraternização Universal - 01/01/2025 (Quarta-feira)
      expect(service.isBusinessDay(new Date('2025-01-01'))).toBe(false);

      // Tiradentes - 21/04/2025 (Segunda-feira)
      expect(service.isBusinessDay(new Date('2025-04-21'))).toBe(false);

      // Natal - 25/12/2025 (Quinta-feira)
      expect(service.isBusinessDay(new Date('2025-12-25'))).toBe(false);
    });

    it('should return false for movable holidays', () => {
      // Carnaval 2025 - 03/03/2025 (Segunda-feira)
      expect(service.isBusinessDay(new Date('2025-03-03'))).toBe(false);

      // Sexta-feira Santa 2025 - 18/04/2025
      expect(service.isBusinessDay(new Date('2025-04-18'))).toBe(false);

      // Corpus Christi 2025 - 19/06/2025 (Quinta-feira)
      expect(service.isBusinessDay(new Date('2025-06-19'))).toBe(false);
    });
  });

  describe('calculateBusinessDaysBefore', () => {
    it('should calculate 7 business days before a date correctly', () => {
      // Aniversário: 20/01/2025 (Segunda-feira)
      // 7 dias úteis antes: 09/01/2025 (Quinta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20'), 7);
      expect(result.getDate()).toBe(9);
      expect(result.getMonth()).toBe(0); // Janeiro = 0
      expect(result.getFullYear()).toBe(2025);
    });

    it('should skip weekends when calculating business days', () => {
      // Aniversário: 13/01/2025 (Segunda-feira)
      // 7 dias úteis antes deve pular o fim de semana
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-13'), 7);

      // Deve ser 02/01/2025 (Quinta-feira), pulando o fim de semana 04-05/01
      expect(result.getDate()).toBe(2);
      expect(result.getMonth()).toBe(0);
    });

    it('should skip holidays when calculating business days', () => {
      // Aniversário: 10/01/2025 (Sexta-feira)
      // Deve pular o feriado de Confraternização (01/01/2025)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-10'), 7);

      // Como 01/01 é feriado (quarta), deve voltar mais um dia
      expect(result.getDate()).toBe(2); // 02/01/2025 (Quinta-feira)
    });

    it('should handle calculation across months', () => {
      // Aniversário: 07/02/2025 (Sexta-feira)
      // 7 dias úteis antes deve voltar para Janeiro
      const result = service.calculateBusinessDaysBefore(new Date('2025-02-07'), 7);

      expect(result.getMonth()).toBe(0); // Janeiro
      expect(result.getFullYear()).toBe(2025);
    });

    it('should handle multiple holidays in sequence (Carnaval)', () => {
      // Aniversário: 14/03/2025 (Sexta-feira)
      // 7 dias úteis antes deve pular Carnaval (03 e 04/03)
      const result = service.calculateBusinessDaysBefore(new Date('2025-03-14'), 7);

      // Deve ser 27/02/2025
      expect(result.getDate()).toBe(27);
      expect(result.getMonth()).toBe(1); // Fevereiro
    });

    it('should calculate 1 business day before correctly', () => {
      // Aniversário: 06/01/2025 (Segunda-feira)
      // 1 dia útil antes: 03/01/2025 (Sexta-feira)
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-06'), 1);

      expect(result.getDate()).toBe(3);
      expect(result.getMonth()).toBe(0);
    });

    it('should calculate 10 business days before correctly', () => {
      // Aniversário: 20/01/2025 (Segunda-feira)
      // 10 dias úteis antes
      const result = service.calculateBusinessDaysBefore(new Date('2025-01-20'), 10);

      // Deve pular 2 fins de semana e o feriado de 01/01
      expect(result.getDate()).toBe(6);
      expect(result.getMonth()).toBe(0);
    });
  });

  describe('countBusinessDaysBetween', () => {
    it('should count business days correctly in a week', () => {
      // De Segunda (06/01) até Sexta (10/01) = 5 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06'),
        new Date('2025-01-10')
      );
      expect(count).toBe(5);
    });

    it('should exclude weekends from count', () => {
      // De Segunda (06/01) até Segunda seguinte (13/01) = 6 dias úteis
      // (exclui sábado e domingo)
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06'),
        new Date('2025-01-13')
      );
      expect(count).toBe(6);
    });

    it('should exclude holidays from count', () => {
      // De 30/12/2024 até 03/01/2025
      // Exclui: 31/12 (terça, dia útil), 01/01 (feriado), 02/01 (quinta, dia útil), 03/01 (sexta, dia útil)
      // Fins de semana: 28-29/12 e 04-05/01
      const count = service.countBusinessDaysBetween(
        new Date('2024-12-30'),
        new Date('2025-01-03')
      );

      // 30/12 (segunda) + 31/12 (terça) + 02/01 (quinta) + 03/01 (sexta) = 4 dias úteis
      // 01/01 é feriado, não conta
      expect(count).toBe(4);
    });

    it('should return 0 for same day', () => {
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-06'),
        new Date('2025-01-06')
      );
      expect(count).toBe(1); // O dia atual conta
    });

    it('should handle range with only weekends', () => {
      // De Sábado (11/01) até Domingo (12/01) = 0 dias úteis
      const count = service.countBusinessDaysBetween(
        new Date('2025-01-11'),
        new Date('2025-01-12')
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
      const birthdayDate = new Date('2025-01-13');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(service.isBusinessDay(triggerDate)).toBe(true);
      expect(triggerDate.getDate()).toBe(2);
    });

    it('should correctly calculate trigger date for birthday after Carnaval', () => {
      // Cenário: Aniversário em 14/03/2025 (sexta)
      // 7 dias úteis antes deve pular Carnaval (03 e 04/03)
      const birthdayDate = new Date('2025-03-14');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(service.isBusinessDay(triggerDate)).toBe(true);

      // Contar dias úteis entre trigger e aniversário deve ser exatamente 7
      const businessDaysCount = service.countBusinessDaysBetween(
        triggerDate,
        birthdayDate
      );
      expect(businessDaysCount).toBe(8); // Inclui o dia do gatilho
    });

    it('should correctly calculate trigger date near year end', () => {
      // Cenário: Aniversário em 02/01/2025 (quinta-feira)
      // 7 dias úteis antes deve voltar para 2024
      const birthdayDate = new Date('2025-01-02');
      const triggerDate = service.calculateBusinessDaysBefore(birthdayDate, 7);

      expect(triggerDate.getFullYear()).toBe(2024);
      expect(service.isBusinessDay(triggerDate)).toBe(true);
    });
  });
});
