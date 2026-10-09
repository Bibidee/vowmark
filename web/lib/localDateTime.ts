const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function pad(value: number) { return value.toString().padStart(2, "0"); }

/** Parse the text input as wall-clock time in the user's local timezone. */
export function parseLocalDateTime(value: string): Date | undefined {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);
  if (!match) return undefined;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return undefined;

  const parsed = new Date(0);
  parsed.setFullYear(year, month - 1, day);
  parsed.setHours(hour, minute, 0, 0);
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
    || parsed.getHours() !== hour
    || parsed.getMinutes() !== minute
  ) return undefined;
  return parsed;
}

export function localUnixSeconds(value: string): bigint {
  const parsed = parseLocalDateTime(value);
  return parsed ? BigInt(Math.floor(parsed.getTime() / 1000)) : 0n;
}

export function formatLocalDateTime(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function localDateTimeFromNow(secondsFromNow: number): string {
  return formatLocalDateTime(new Date(Date.now() + secondsFromNow * 1000));
}
