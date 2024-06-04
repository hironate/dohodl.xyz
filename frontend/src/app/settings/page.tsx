import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NetworkModeSwitcher from "@/components/Header/NetworkModeSwitcher";
import DarkModeSwitcher from "@/components/Header/DarkModeSwitcher";
import { DefaultMetadata } from "@/utils/constant";

export const metadata = DefaultMetadata;

const Settings = () => {
  return (
    <div className="mx-auto flex max-w-270 flex-col justify-center gap-6">
      <Breadcrumb pageName="Settings" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            App Settings
          </h3>
        </div>
        <div className="p-7">
          <div className="mb-5.5 flex flex-col gap-5.5">
            <div className="setting-item flex w-full items-center justify-between">
              <div className="setting-label mb-3 block font-semibold text-black dark:text-white">
                Theme
              </div>
              <div className="setting-action">
                <DarkModeSwitcher />
              </div>
            </div>
            <div className="setting-item flex w-full items-center justify-between">
              <div className="setting-label mb-3 block font-semibold text-black dark:text-white">
                Testnet
              </div>
              <div className="setting-action">
                <NetworkModeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
