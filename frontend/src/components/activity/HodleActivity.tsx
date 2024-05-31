import useNetworkMode from "@/hooks/useNetworkMode";
import { ActivityFilters, DataByChainName } from "@/types/locks";
import {
  combineDataFromChainName,
  formatActivityByChainName,
} from "@/utils/locks";
import { useEffect, useMemo, useState } from "react";
import { useConfig } from "wagmi";
import ActivityRow from "./ActivityRow";
import usePagination from "@/hooks/usePagination";
import Pagination from "../Pagination";

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
  const [filterBy, setFilterBy] = useState<ActivityFilters>({
    chain: "All",
    type: "All",
  });

  const config = useConfig();
  const [networkMode] = useNetworkMode();

  const filterByActivities = useMemo(
    () =>
      formatedActivities.filter(
        (activity) =>
          (activity.chainName === filterBy.chain || filterBy.chain === "All") &&
          (activity.activityType === filterBy.type || filterBy.type === "All"),
      ),
    [formatedActivities, filterBy],
  );

  const {
    currentPage,
    currentPageData: currentPageActivities,
    setPage,
    totalPages,
  } = usePagination(filterByActivities, 5);

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
    <div className="col-span-12 mt-4 rounded-sm border border-stroke bg-white px-5 pb-5  pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 md:mt-6 2xl:mt-7.5 ">
      <div className="w-full overflow-hidden rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex w-full justify-between">
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Activity
          </h4>
        </div>

        <div className="no-scrollbar flex  flex-col overflow-x-scroll text-start sm:w-full">
          <div>
            <ActivityRow
              isUserActivity={isUserActivity}
              setFilters={setFilterBy}
            />
          </div>

          <div className="no-scrollbar relative h-full w-full overflow-y-auto ">
            {!isFormatingActivities ? (
              !!currentPageActivities.length ? (
                currentPageActivities.map((activity: any, index: number) => {
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
        <div className="flex w-full justify-end p-3">
          <Pagination
            page={currentPage}
            shape="rounded"
            onChange={(event, page) => setPage(page)}
            count={totalPages}
            className="text-primary "
            color="primary"
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
