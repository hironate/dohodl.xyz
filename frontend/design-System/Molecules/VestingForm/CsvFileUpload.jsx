import { Label } from "../../Atom/Label";
import { Button } from "../../Atom/Button";
import VestingHeaderData from "../VestingHeaderData";
import { useState } from "react";
import { Icon } from "../../Atom/Icon";
import { FiArrowLeft } from "react-icons/fi";
import CsvData from "./CsvData";
import Link from "next/link";
export default function CsvFileUpload({
  onFileSubmit,
  csvData,
  tokenData,
  vestingData,
  resetValues,
  handleApprove,
  createVesting,
  loading,
  isApproved,
  isProcessing
}) {
  const [file, setFile] = useState();
  const [disabled, setDisabled] = useState(true);

  const handleBackClick = () => {
    resetValues();
  };
  const handleOnFileChange = (e) => {
    setFile(e.target.files[0]);
    setDisabled(false);
  };
  const handleSubmit = () => {
    onFileSubmit(file);
  };


  return (
    <>
      <div className="flex w-full bg-gray-200 items-center p-3">
        <span onClick={handleBackClick}>
          <Icon icon={FiArrowLeft} className="xl" />
        </span>
        <Label className="text-lg font-bold text-slate-700 ml-4">
          {csvData ? "CSV File Data" : "Upload CSV"}
        </Label>
      </div>
      {csvData ? (
        <>
          <VestingHeaderData textData="Your vesting Schedule Data" />
          <CsvData csvData={csvData} tokenData={tokenData} vestingData={vestingData} handleApprove={handleApprove} createVesting={createVesting} loading={loading} isApproved={isApproved} isProcessing={isProcessing} />
        </>
      ) : (<>
        <VestingHeaderData textData="Click the button below to upload a CSV from your device" />
        <div className="flex justify-center">
          <div className="p-4  ">
            <input
              className="p-2 mb-3 border-gray-200 border-2 rounded-lg w-full"
              type={"file"}
              accept={".csv"}
              onChange={handleOnFileChange}
            />
            <div className="pb-2 flex justify-center text-sm text-blue-600">
              <Link href={"https://www.team.finance/assets/Sample-v2.csv"} download>
                click here to download a sample CSV
              </Link>
            </div>
            <Button
              className="button bg-blue-600 text-white hover:bg-blue-700  hover:shadow-md w-full"
              type="button"
              disabled={disabled}
              blocked={true}
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </div>
        </div>
      </>
      )}
    </>
  );
}
