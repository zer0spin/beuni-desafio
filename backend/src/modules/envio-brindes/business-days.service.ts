import { Injectable } from '@nestjs/common';
import { addDays, isWeekend, format } from 'date-fns';

@Injectable()
export class BusinessDaysService {
  // Fixed national holidays (simplified for MVP)
  private readonly feriadosFixos = [
    '01-01', // New Year's Day
    '04-21', // Tiradentes
    '09-07', // Independence of Brazil
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamation of the Republic
    '12-25', // Natal
  ];

  // Approximate movable holidays (ideally use a specific library)
  private readonly feriadosMoveis2024 = [
    '2024-02-12', // Carnaval
    '2024-02-13', // Carnaval
    '2024-03-29', // Sexta-feira Santa
    '2024-05-30', // Corpus Christi
  ];

  private readonly feriadosMoveis2025 = [
    '2025-03-03', // Carnaval
    '2025-03-04', // Carnaval
    '2025-04-18', // Sexta-feira Santa
    '2025-06-19', // Corpus Christi
  ];

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
    // Verificar se é final de semana
    if (isWeekend(date)) {
      return false;
    }

    // Verificar se é feriado
    if (this.isHoliday(date)) {
      return false;
    }

    return true;
  }

  /**
   * Verifica se uma data é feriado nacional
   */
  private isHoliday(date: Date): boolean {
    const year = date.getFullYear();
    const monthDay = format(date, 'MM-dd');
    const fullDate = format(date, 'yyyy-MM-dd');

    // Verificar feriados fixos
    if (this.feriadosFixos.includes(monthDay)) {
      return true;
    }

    // Verificar feriados móveis por ano
    if (year === 2024 && this.feriadosMoveis2024.includes(fullDate)) {
      return true;
    }

    if (year === 2025 && this.feriadosMoveis2025.includes(fullDate)) {
      return true;
    }

    return false;
  }

  /**
   * Retorna a lista de feriados para um ano específico
   */
  getHolidaysForYear(year: number): string[] {
    const feriados: string[] = [];

    // Adicionar feriados fixos
    this.feriadosFixos.forEach(monthDay => {
      feriados.push(`${year}-${monthDay}`);
    });

    // Adicionar feriados móveis
    if (year === 2024) {
      feriados.push(...this.feriadosMoveis2024);
    } else if (year === 2025) {
      feriados.push(...this.feriadosMoveis2025);
    }

    return feriados.sort();
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