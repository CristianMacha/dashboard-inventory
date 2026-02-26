const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(dateStr: string): string {
  try {
    return dateFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
