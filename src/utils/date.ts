import {
  differenceInDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  startOfDay,
} from 'date-fns';

export const fmtShortDate = (ts: number) => format(ts, 'dd MMM yyyy');
export const fmtTime = (ts: number) => format(ts, 'h:mm a');
export const fmtRelative = (ts: number) =>
  `${formatDistanceToNowStrict(ts, { addSuffix: false })} ago`;

export const sectionLabel = (ts: number): string => {
  if (isToday(ts)) return 'TODAY';
  if (isYesterday(ts)) return 'YESTERDAY';
  return format(ts, 'MMM d').toUpperCase();
};

export const daysOverdue = (dueDate: number): number => {
  const today = startOfDay(Date.now());
  const due = startOfDay(dueDate);
  return Math.max(0, differenceInDays(today, due));
};

export const isOverdue = (dueDate?: number) =>
  typeof dueDate === 'number' && dueDate < startOfDay(Date.now()).getTime();
