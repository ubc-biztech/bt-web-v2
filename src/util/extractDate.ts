// extractdate.ts
export function extractTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const hours = date.getHours(); // local time
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")}${ampm}`;
}

export function extractMonthDay(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    // no timeZone -> use browser local
  };
  return date.toLocaleDateString("en-US", options);
}

export const shortformatDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const formattedDateTime = `${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase().replace(" ", "")} ${date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    .toUpperCase()}`;

  return formattedDateTime;
};