export function timeDifference(time) {
  const currentTime = new Date().getTime();
  let timestampDifference = new Date(time - currentTime);

  let year = timestampDifference.getUTCFullYear() - 1970;
  let month = timestampDifference.getUTCMonth();
  let day = timestampDifference.getUTCDate() - 1;
  let hour = timestampDifference.getUTCHours();

  const diff = {
    remainingYear: function () {
      return year > 0 ? year + ' year ' : '';
    },
    remainingMonth: function () {
      return month > 0 ? month + ' month ' : '';
    },
    remainingDays: function () {
      return day > 0 ? day + ' day ' + hour + ' hr' : '';
    },
    remainingHour: function () {
      if (year <= 0 && month <= 0) {
        return hour > 0
          ? hour + ' hr'
          : Math.ceil(timestampDifference / 1000 / 60) + ' min';
      }
    },
  };

  let timeDifference =
    diff.remainingYear() +
    '' +
    diff.remainingMonth() +
    '' +
    diff.remainingDays();

  timeDifference =
    timeDifference.length > 0 ? timeDifference : diff.remainingHour();

  return timeDifference;
}
