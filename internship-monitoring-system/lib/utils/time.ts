export function formatTime12Hour(time: string | null | undefined) {
  if (!time) return "Not Configured";

  const [hour, minute] = time.split(":");

  return new Date(
    2000,
    0,
    1,
    Number(hour),
    Number(minute)
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatWorkingHours(
  workingHours: string | null | undefined
) {
  if (!workingHours) return "Not Configured";

  const [start, end] = workingHours.split(" - ");

  return `${formatTime12Hour(start)} - ${formatTime12Hour(end)}`;
}