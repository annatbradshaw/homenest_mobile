// Pure data file - no React/JSX dependencies
// This allows importing in Node test environment

export type DateFormatType = 'mdy' | 'dmy' | 'ymd';

export interface DateFormatOption {
  id: DateFormatType;
  label: string;
  example: string;
  shortFormat: string;  // PP equivalent
  longFormat: string;   // PPP equivalent
}

export const DATE_FORMATS: DateFormatOption[] = [
  { id: 'mdy', label: 'MM/DD/YYYY', example: '12/06/2025', shortFormat: 'MM/dd/yyyy', longFormat: 'MMMM d, yyyy' },
  { id: 'dmy', label: 'DD/MM/YYYY', example: '06/12/2025', shortFormat: 'dd/MM/yyyy', longFormat: 'd MMMM yyyy' },
  { id: 'ymd', label: 'YYYY-MM-DD', example: '2025-12-06', shortFormat: 'yyyy-MM-dd', longFormat: 'yyyy MMMM d' },
];
