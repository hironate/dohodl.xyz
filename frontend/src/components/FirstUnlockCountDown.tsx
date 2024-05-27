import React, { useEffect } from "react";
import CountDown from "./CountDown";
import moment from "moment";

const FirstUnlockCountDown = ({
  upcomingUnlockDateTime,
}: {
  upcomingUnlockDateTime: Date;
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1">
      <div className="day text-xs font-semibold">Next unlock</div>
      <div className="day text-sm font-semibold">
        {moment(upcomingUnlockDateTime).format("LL")}
      </div>

      <div className="counter pt-2">
        <CountDown durationOrEndDate={upcomingUnlockDateTime} />
      </div>
    </div>
  );
};

export default FirstUnlockCountDown;
