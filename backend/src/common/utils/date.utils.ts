/**
 * Date utility functions
 * Single Responsibility Principle: Centralize date operations
 */

import { getYear } from 'date-fns';

export class DateUtils {
  /**
   * Get current year
   */
  static getCurrentYear(): number {
    return getYear(new Date());
  }

  /**
   * Create birthday date for specific year
   */
  static createBirthdayForYear(birthDate: Date, year: number): Date {
    return new Date(year, birthDate.getMonth(), birthDate.getDate());
  }

  /**
   * Create date at midnight (start of day)
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    const d1 = this.startOfDay(date1);
    const d2 = this.startOfDay(date2);
    return d1.getTime() === d2.getTime();
  }

  /**
   * Get month from date (1-12)
   */
  static getMonthNumber(date: Date): number {
    return date.getMonth() + 1;
  }
}
