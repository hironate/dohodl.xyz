import { ethers } from 'ethers';
import { useState } from "react";
import { toast } from "react-toastify";
import VestingInfo from "../../Molecules/VestingForm/VestingInfo";
import { vestingContractAddress } from "../../../constant";
import CsvFileUpload from "../../Molecules/VestingForm/CsvFileUpload";
import { approveToken } from '../../../infrastructure/smart-contracts/ERC20Contract';
import { createVestingSchedule } from '../../../infrastructure/smart-contracts/VesterContract';
const Vester = ({ fetchDepositorsVestings }) => {
  const [secondStep, setSecondStep] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [vestingData, setVestingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileReader = new FileReader();

  const refreshValues = () => {
    setSecondStep(false);
    setTokenData(null);
    setVestingData(null);
    setCsvData(null);
    setLoading(false);
    setIsApproved(false);
    setIsProcessing(false);
  };

  const handleFileSubmit = (file) => {
    if (file) {
      fileReader.onload = async (event) => {
        const csvOutput = event.target.result;
        const fileData = csvOutput.split(/\r?\n|,/);
        const receiversAddress = [];
        const amount = [];
        const totalToken = 0;
        for (let i = 0; i < fileData.length - 1; i++) {
          if (i % 2 == 0) {
            let result = ethers.utils.isAddress(fileData[i])
            if (!result) {
              toast.error("Invalid File Input");
              return;
            }
            receiversAddress.push(fileData[i]);
          } else {
            const result = (!isNaN(fileData[i]) && !isNaN(parseFloat(fileData[i])));
            if (!result || (result && Number(fileData[i]) <= 0)) {
              toast.error("Invalid File Input");
              return;
            }
            amount.push(ethers.utils.parseUnits(fileData[i], tokenData.decimal));
            totalToken += Number(fileData[i]);
          }
        }
        console.log('amount', totalToken);
        setCsvData({ address: receiversAddress, totalToken: totalToken, amount: amount });
      };

      fileReader.readAsText(file);
    }
  };

  const handleApprove = async () => {
    if (tokenData.balance < csvData.totalToken) {
      toast.error("Not enough Tokens");
      return;
    }
    try {
      setLoading(true);
      const transaction = await approveToken(tokenData.address, vestingContractAddress, ethers.utils.parseUnits(csvData.totalToken.toString(), tokenData.decimal));
      toast.success(
        "Approving: Transaction is placed, wait till it gets confirmed on blockchain"
      );
      await transaction.wait();
      toast.success("Approved Successfully");
      setLoading(false);
      setIsApproved(true);
    } catch (error) {
      setLoading(false);
    }
  };

  const createVesting = async () => {
    setIsProcessing(true);
    try {
      const transaction = await createVestingSchedule(
        csvData.address,
        tokenData.address,
        csvData.amount,
        vestingData.startDate,
        vestingData.cliff,
        vestingData.endDate - vestingData.startDate,
        vestingData.slicePeriod,
        vestingData.revocable
      );
      if (transaction) {
        toast.success(
          "Vesting: Transaction is placed, wait till it gets confirmed on blockchain"
        );
        await transaction.wait();
      }
      toast.success("Vested Successfully");
      setTimeout(() => {
        fetchDepositorsVestings();
        refreshValues();
      }, 3000)

    } catch (error) {
      setIsProcessing(false);
      throw new Error(error);
    }
  };
  return (
    <div className="mx-auto w-full lg:w-4/12 md:w-2/3 bg-white shadow-lg rounded-md font-sans mt-10 p-2 ">
      {!secondStep ? (
        <VestingInfo
          updateTokenData={setTokenData}
          updateVestingData={setVestingData}
          updateStep={setSecondStep}
          refreshValues={refreshValues}
        />
      ) : (
        <CsvFileUpload
          onFileSubmit={handleFileSubmit}
          resetValues={refreshValues}
          csvData={csvData}
          tokenData={tokenData}
          vestingData={vestingData}
          handleApprove={handleApprove}
          createVesting={createVesting}
          loading={loading}
          isApproved={isApproved}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default Vester;
