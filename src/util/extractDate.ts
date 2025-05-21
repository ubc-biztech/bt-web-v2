export function extractTime(dateTimeString: string): string {
  const date = new Date(dateTimeString); // Create date object from ISO 8601 string
  const hours = date.getUTCHours(); // Get hours in UTC
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  // Convert hours from 24-hour format to 12-hour format
  const formattedHours = hours % 12 || 12; // Handle midnight (0 hours)

  // Format the time as HH:mmam/pm
  const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")}${ampm}`;

  return formattedTime;
}

export function extractMonthDay(dateTimeString: string): string {
  const date = new Date(dateTimeString); // Creates a date object from ISO 8601 string
  const options: Intl.DateTimeFormatOptions = {
    month: "long", // Full month name
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };

  // Format the date using Intl.DateTimeFormat
  const formattedDate = date.toLocaleDateString("en-US", options);

  return formattedDate;
}
