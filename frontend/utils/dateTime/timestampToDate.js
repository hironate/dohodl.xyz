export function timeStampToDate(timestamp) {
  let date = new Date(timestamp * 1000);
  date = date.toDateString().slice(4);
  return date;
}
