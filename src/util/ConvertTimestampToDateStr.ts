export function convertTimestampToDateStr(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString();  // or any other format you prefer
}
