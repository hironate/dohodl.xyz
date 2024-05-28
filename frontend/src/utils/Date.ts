import moment from "moment";

export const formatDateUsingDuration = (date: number | string) => {
  let currentDate = moment();

  // Calculate the difference between the current date and the past date
  let duration = moment.duration(currentDate.diff(moment(date)));

  // Get the years, months, days, hours, minutes, and seconds difference
  let years = duration.years();
  let months = duration.months();
  let days = duration.days();
  let hours = duration.hours();
  let minutes = duration.minutes();
  let seconds = duration.seconds();

  // Construct the time ago string based on the difference
  let timeAgo = "";
  if (years > 0) {
    timeAgo = years + " year" + (years > 1 ? "s" : "");
  } else if (months > 0) {
    timeAgo = months + " month" + (months > 1 ? "s" : "");
  } else if (days > 0) {
    timeAgo = days + " day" + (days > 1 ? "s" : "");
  } else if (hours > 0) {
    timeAgo = hours + " hour" + (hours > 1 ? "s" : "");
  } else if (minutes > 0) {
    timeAgo = minutes + " minute" + (minutes > 1 ? "s" : "");
  } else {
    timeAgo = seconds + " second" + (seconds > 1 ? "s" : "");
  }
  timeAgo = timeAgo + " ago";

  return timeAgo;
};
