import { formatDistanceToNow, addHours, isPast, differenceInHours, differenceInMinutes, format } from 'date-fns';

export function getDeadlineDate(incidentTime: string, deadlineHours: number): Date {
  return addHours(new Date(incidentTime), deadlineHours);
}

export function isOverdue(incidentTime: string, deadlineHours: number): boolean {
  return isPast(getDeadlineDate(incidentTime, deadlineHours));
}

export function getTimeRemaining(incidentTime: string, deadlineHours: number): string {
  const deadline = getDeadlineDate(incidentTime, deadlineHours);
  if (isPast(deadline)) return 'OVERDUE';

  const hoursLeft = differenceInHours(deadline, new Date());
  const minsLeft = differenceInMinutes(deadline, new Date()) % 60;

  if (hoursLeft >= 24) {
    const days = Math.floor(hoursLeft / 24);
    return `${days}d ${hoursLeft % 24}h remaining`;
  }
  return `${hoursLeft}h ${minsLeft}m remaining`;
}

export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), 'dd MMM yyyy, HH:mm');
}

export function formatDate(isoString: string): string {
  return format(new Date(isoString), 'dd MMM yyyy');
}

export function formatTimeAgo(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true });
}
