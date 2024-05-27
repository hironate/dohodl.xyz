import useNetworkMode from "@/hooks/useNetworkMode";
import { DataByChainName } from "@/types/locks";
import { formatDateUsingDuration } from "@/utils/Date";
import { toShortAddress } from "@/utils/String";
import {
  combineDataFromChainName,
  formatActivityByChainName,
  formatNumber,
} from "@/utils/locks";
import { formatEther } from "ethers";
import { useEffect, useState } from "react";
import { useConfig } from "wagmi";
import ActivityRow from "./ActivityRow";

const ActivityTable = ({
  className,
  activities,
  isUserActivity = false,
}: {
  className?: string;
  activities?: DataByChainName;
  isUserActivity?: boolean;
}) => {
  const [formatedActivities, setFormatedActivities] = useState<any[]>([]);
  const [isFormatingActivities, setIsFormatingActivities] = useState(false);
  const config = useConfig();
  const [networkMode] = useNetworkMode();

  useEffect(() => {
    async function formatData() {
      if (activities) {
        setIsFormatingActivities(true);
        const formatedDataByChainName = await formatActivityByChainName(
          activities,
          config,
          networkMode === "testnet",
        );
        const formatedDatas = combineDataFromChainName(formatedDataByChainName);
        formatedDatas.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setIsFormatingActivities(false);
        setFormatedActivities(formatedDatas);
      }
    }
    formatData();
    return () => {
      setIsFormatingActivities(false);
    };
  }, [activities, config, networkMode]);

  return (
    <div className="w-full overflow-hidden rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Activity
      </h4>

      <div className="no-scrollbar flex min-w-fit flex-col overflow-x-scroll text-start sm:w-full md:min-w-max">
        <div>
          <ActivityRow isUserActivity={isUserActivity} />
        </div>

        <div className="no-scrollbar relative h-full max-h-[300px] w-full min-w-full overflow-y-auto md:min-w-max">
          {!isFormatingActivities ? (
            !!formatedActivities.length ? (
              formatedActivities.map((activity: any, index: number) => {
                return (
                  <ActivityRow
                    index={index}
                    key={index}
                    activity={activity}
                    isUserActivity={isUserActivity}
                  />
                );
              })
            ) : (
              <div className="flex w-full items-center justify-center gap-3 py-10">
                <div className="text-body dark:text-bodydark">
                  No Activity Found
                </div>
              </div>
            )
          ) : (
            <div className="flex w-full items-center justify-center gap-3 py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-primary-neon border-t-transparent"></div>
              <div className="text-body dark:text-bodydark">
                Loading Activities ...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
