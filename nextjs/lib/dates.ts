const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function localDayKey(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDayKey(value: string): boolean {
  if (!DAY_KEY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function selectedDay(value: string | undefined): string | null {
  return value && isDayKey(value) ? value : null;
}

export function isOnDay(iso: string, day: string): boolean {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return false;
  return localDayKey(iso) === day;
}
