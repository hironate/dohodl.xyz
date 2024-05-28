import useTimer from "@/hooks/useTimer";

const CountDown = ({ durationOrEndDate }: { durationOrEndDate: Date }) => {
  const { days, hours, minutes, seconds } = useTimer(durationOrEndDate);

  return (
    <div className="flex h-full w-full justify-center gap-6 text-lg font-bold  text-primary-neon dark:text-secondary-neon sm:text-base md:text-3xl xl:text-xl 2xl:text-3xl">
      {days !== 0 && (
        <div className="flex flex-col items-center gap-1">
          <span>{days}</span>
          <span className="text-body dark:text-bodydark sm:text-xs xl:text-sm">
            Day
          </span>
        </div>
      )}
      {hours && (
        <div className="flex flex-col items-center gap-1">
          <span>{hours}</span>
          <span className="text-body dark:text-bodydark sm:text-xs xl:text-sm">
            Hour
          </span>
        </div>
      )}
      {minutes && (
        <div className="flex flex-col items-center gap-1">
          <span>{minutes}</span>
          <span className="text-body dark:text-bodydark sm:text-xs 2xl:text-sm">
            Minute
          </span>
        </div>
      )}
      {seconds && (
        <div className="flex flex-col items-center gap-1">
          <span>{seconds}</span>
          <span className="text-body dark:text-bodydark sm:text-xs 2xl:text-sm">
            Second
          </span>
        </div>
      )}
    </div>
  );
};

export default CountDown;
