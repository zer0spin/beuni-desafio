/**
 * Constants for EnvioBrindes module
 * Following Clean Code principles: Extract magic numbers and strings
 */

export const ENVIO_BRINDES_CONSTANTS = {
  /** Number of business days before birthday to trigger gift sending */
  BUSINESS_DAYS_BEFORE_BIRTHDAY: 7,
  
  /** Maximum items per page in pagination */
  MAX_ITEMS_PER_PAGE: 100,
  
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 10,
  
  /** Cron schedule: Every day at 6:00 AM */
  CRON_SCHEDULE: '0 6 * * *',
  
  /** Timezone for cron jobs */
  TIMEZONE: 'America/Sao_Paulo',
} as const;

export const ENVIO_STATUS = {
  PENDENTE: 'PENDENTE',
  PRONTO_PARA_ENVIO: 'PRONTO_PARA_ENVIO',
  ENVIADO: 'ENVIADO',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO',
} as const;

export type EnvioStatus = typeof ENVIO_STATUS[keyof typeof ENVIO_STATUS];

export const MONTH_NAMES_PT_BR = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;
