import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

interface Holiday {
  date: string; // formato: YYYY-MM-DD
  name: string;
  type: 'fixed' | 'movable';
}

@Injectable()
export class HolidaysService {
  // Feriados fixos nacionais brasileiros
  private readonly fixedHolidays = [
    { monthDay: '01-01', name: 'Confraternização Universal' },
    { monthDay: '04-21', name: 'Tiradentes' },
    { monthDay: '05-01', name: 'Dia do Trabalho' },
    { monthDay: '09-07', name: 'Independência do Brasil' },
    { monthDay: '10-12', name: 'Nossa Senhora Aparecida' },
    { monthDay: '11-02', name: 'Finados' },
    { monthDay: '11-15', name: 'Proclamação da República' },
    { monthDay: '11-20', name: 'Consciência Negra' }, // Feriado nacional desde 2024
    { monthDay: '12-25', name: 'Natal' },
  ];

  // Feriados móveis conhecidos (pré-calculados)
  // Fonte: https://www.anbima.com.br/feriados/feriados.asp
  private readonly movableHolidaysByYear: Record<number, Holiday[]> = {
    2024: [
      { date: '2024-02-12', name: 'Carnaval', type: 'movable' },
      { date: '2024-02-13', name: 'Carnaval (Terça-feira)', type: 'movable' },
      { date: '2024-03-29', name: 'Sexta-feira Santa', type: 'movable' },
      { date: '2024-03-31', name: 'Páscoa', type: 'movable' },
      { date: '2024-05-30', name: 'Corpus Christi', type: 'movable' },
    ],
    2025: [
      { date: '2025-03-03', name: 'Carnaval', type: 'movable' },
      { date: '2025-03-04', name: 'Carnaval (Terça-feira)', type: 'movable' },
      { date: '2025-04-18', name: 'Sexta-feira Santa', type: 'movable' },
      { date: '2025-04-20', name: 'Páscoa', type: 'movable' },
      { date: '2025-06-19', name: 'Corpus Christi', type: 'movable' },
    ],
    2026: [
      { date: '2026-02-16', name: 'Carnaval', type: 'movable' },
      { date: '2026-02-17', name: 'Carnaval (Terça-feira)', type: 'movable' },
      { date: '2026-04-03', name: 'Sexta-feira Santa', type: 'movable' },
      { date: '2026-04-05', name: 'Páscoa', type: 'movable' },
      { date: '2026-06-04', name: 'Corpus Christi', type: 'movable' },
    ],
  };

  /**
   * Normaliza uma data para comparação (remove hora, minuto, segundo e ms)
   */
  private normalizeDate(date: Date): string {
    return format(new Date(date.getFullYear(), date.getMonth(), date.getDate()), 'yyyy-MM-dd');
  }

  /**
   * Retorna todos os feriados de um ano específico
   */
  getHolidaysForYear(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // Adicionar feriados fixos
    this.fixedHolidays.forEach(({ monthDay, name }) => {
      holidays.push({
        date: `${year}-${monthDay}`,
        name,
        type: 'fixed',
      });
    });

    // Adicionar feriados móveis se disponíveis
    const movableHolidays = this.movableHolidaysByYear[year] || [];
    holidays.push(...movableHolidays);

    // Ordenar por data
    return holidays.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Verifica se uma data é feriado nacional
   */
  isHoliday(date: Date): boolean {
    const dateStr = this.normalizeDate(date);
    const monthDay = format(date, 'MM-dd');

    // Verificar feriados fixos
    const isFixedHoliday = this.fixedHolidays.some(h => h.monthDay === monthDay);
    if (isFixedHoliday) {
      return true;
    }

    // Verificar feriados móveis
    const year = date.getFullYear();
    const movableHolidays = this.movableHolidaysByYear[year] || [];
    const isMovableHoliday = movableHolidays.some(h => h.date === dateStr);

    return isMovableHoliday;
  }

  /**
   * Retorna o nome do feriado se a data for um feriado
   */
  getHolidayName(date: Date): string | null {
    const dateStr = this.normalizeDate(date);
    const monthDay = format(date, 'MM-dd');

    // Verificar feriados fixos
    const fixedHoliday = this.fixedHolidays.find(h => h.monthDay === monthDay);
    if (fixedHoliday) {
      return fixedHoliday.name;
    }

    // Verificar feriados móveis
    const year = date.getFullYear();
    const movableHolidays = this.movableHolidaysByYear[year] || [];
    const movableHoliday = movableHolidays.find(h => h.date === dateStr);

    return movableHoliday?.name || null;
  }

  /**
   * Retorna os próximos N feriados a partir de uma data
   */
  getUpcomingHolidays(fromDate: Date, count: number = 5): Holiday[] {
    const year = fromDate.getFullYear();
    const fromDateStr = this.normalizeDate(fromDate);

    // Buscar feriados do ano atual e próximo
    const currentYearHolidays = this.getHolidaysForYear(year);
    const nextYearHolidays = this.getHolidaysForYear(year + 1);

    const allHolidays = [...currentYearHolidays, ...nextYearHolidays];

    // Filtrar apenas feriados futuros
    const upcomingHolidays = allHolidays
      .filter(h => h.date >= fromDateStr)
      .slice(0, count);

    return upcomingHolidays;
  }

  /**
   * Conta quantos feriados existem entre duas datas
   */
  countHolidaysBetween(startDate: Date, endDate: Date): number {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startDateStr = this.normalizeDate(startDate);
    const endDateStr = this.normalizeDate(endDate);

    let count = 0;

    // Buscar feriados de todos os anos no intervalo
    for (let year = startYear; year <= endYear; year++) {
      const holidays = this.getHolidaysForYear(year);

      const holidaysInRange = holidays.filter(
        h => h.date >= startDateStr && h.date <= endDateStr
      );

      count += holidaysInRange.length;
    }

    return count;
  }
}
