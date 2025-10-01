import { Injectable } from '@nestjs/common';
import { addDays } from 'date-fns';
import { HolidaysService } from './holidays.service';

@Injectable()
export class BusinessDaysService {
  constructor(private readonly holidaysService: HolidaysService) {}

  /**
   * Calcula a data que é N dias úteis antes de uma data específica
   */
  calculateBusinessDaysBefore(targetDate: Date, businessDays: number): Date {
    let currentDate = new Date(targetDate);
    let daysToSubtract = 0;

    // Voltar no tempo até encontrar o número correto de dias úteis
    while (businessDays > 0) {
      daysToSubtract++;
      currentDate = addDays(targetDate, -daysToSubtract);

      if (this.isBusinessDay(currentDate)) {
        businessDays--;
      }
    }

    return currentDate;
  }

  /**
   * Verifica se uma data é um dia útil (não é final de semana nem feriado)
   */
  isBusinessDay(date: Date): boolean {
    // Verificar se é final de semana usando UTC day
    // 0 = Sunday, 6 = Saturday
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // Verificar se é feriado usando o HolidaysService
    if (this.holidaysService.isHoliday(date)) {
      return false;
    }

    return true;
  }

  /**
   * Retorna a lista de feriados para um ano específico
   */
  getHolidaysForYear(year: number): string[] {
    const holidays = this.holidaysService.getHolidaysForYear(year);
    return holidays.map(h => h.date);
  }

  /**
   * Calcula quantos dias úteis existem entre duas datas
   */
  countBusinessDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.isBusinessDay(currentDate)) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }

    return count;
  }
}