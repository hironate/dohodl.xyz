import { ethers } from 'ethers';
import { Label } from '../../Atom/Label';
import { Spinner } from "../../Atom/Spinner";
import VestingDetails from "../../Molecules/Modals/VesteingDetails";
import Table from "../../Molecules/Table";
import NoRecord from "../../Molecules/NoRecord";
import { timeStampToDate } from "../../../utils/dateTime/timestampToDate";
import { FaLock } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { Image } from "../../Atom/Image";
import { useEffect, useState } from 'react';
import { secondsToDHMS } from '../../../utils/dateTime/seconds-to-dhms';
const ReceiversVesting = ({ receives, loading, fetchReceiversVestings, refreshData }) => {
    const chainData = useSelector((state) => state).ChainDataReducer;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [rowsData, setRowsData] = useState([]);
    const columns = [
        { heading: "S.no", value: "sNo" },
        { heading: "Token", value: "tokenSymbol" },
        { heading: "Amount", value: "lockAmount" },
        { heading: "Next Unlock", value: "nextUnlockDate" },
        { heading: "Claimable", value: "Withdrawable" },
        { heading: "Already Claimed", value: "released" },
        { heading: "Action", value: "view" },
    ];
    const noRecordText = ['No Receives Available', 'You have not any vesting receives yet.'];


    const getNextUnlockDate = (params) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const start = Number(params.start);
        const slicePeriod = Number(params.slicePeriod);
        const vestingTime = currentTime > start ? currentTime - start : 0;
        const vestingCycles = Math.ceil(vestingTime / slicePeriod);
        const nextUnlockTimestamp = new Date(
            (start + vestingCycles * slicePeriod) * 1000
        );
        return (
            nextUnlockTimestamp.toDateString().slice(4) +
            "  " +
            nextUnlockTimestamp.getHours() +
            ":" +
            nextUnlockTimestamp.getMinutes()
        );
    };
    const viewData = () => {
        return (
            <button className="border-2 border-indigo-200 px-2 rounded-md hover:shadow-lg">
                View
            </button>
        );
    }
    const getVestedAmount = (amount) => {
        return (
            <div className="flex items-center">
                <FaLock className="text-xs mx-1" />
                <span>{amount}</span>
            </div>
        );
    }
    const withdrawable = (vesterData, released, amount) => {
        const currentTime = Date.now() / 1000;
        if (
            currentTime <
            Number(vesterData.start) + Number(vesterData.cliff)
        ) {
            return 0;
        }
        if (
            currentTime >
            Number(vesterData.start) + Number(vesterData.duration)
        ) {
            return (
                amount - released
            );
        }

        const cycle = parseInt((currentTime - Number(vesterData.start)) / Number(vesterData.slicePeriod));

        const amountReturn =
            (cycle *
                Number(amount) *
                Number(vesterData.slicePeriod)) /
            Number(vesterData.duration) -
            released;

        return amountReturn;
    };
    const getTokenSymbol = (symbol) => {
        return (
            <div className='flex'>
                <Image
                    src={chainData.logoUrl}
                    alt={"$"}
                    className={"w-6"}
                />
                <span className='pl-2 '>{symbol}</span>
            </div>
        )
    }
    const handleOnRowClick = (data) => {
        setModalData(data);
        setIsModalOpen(true);
    }
    useEffect(() => {
        let tableData = [];
        for (let i = 0; i < receives.length; i++) {
            const e = receives[i];
            const row = {
                sNo: i + 1,
                id: e.vestingId.vestingId,
                lockDate: timeStampToDate(Number(e.vestingId.start)),
                nextUnlockDate: getNextUnlockDate(e.vestingId),
                endDate: timeStampToDate(
                    Number(e.vestingId.start) + Number(e.vestingId.duration)
                ),
                lockAmount: getVestedAmount(ethers.utils.formatUnits(e.amount, e.vestingId.decimal)),
                token: e.vestingId.token,
                tokenSymbol: getTokenSymbol(e.vestingId.symbol),
                owner: e.vestingId.owner,
                cliff: secondsToDHMS(Number(e.vestingId.cliff)),
                slicePeriod: secondsToDHMS(Number(e.vestingId.slicePeriod)),
                revocable: e.vestingId.revocable ? 'Yes' : 'No',
                revoked: e.revoked ? 'Yes' : 'No',
                released: Number(e.released),
                Withdrawable: withdrawable(e.vestingId, ethers.utils.formatEther(e.released, e.vestingId.decimal), ethers.utils.formatEther(e.amount, e.vestingId.decimal)),
                view: viewData(),


            };
            tableData.push(row);
        }
        setRowsData(tableData);
    }, [receives])


    return (
        <div className='p-3'>
            <section className="container   mx-auto justify-center items-center  ">
                <Label className="text-left py-2 text-3xl font-bold  mb-0.5">
                    Receives
                </Label>
                {loading ? (
                    <div className="flex flex-col justify-center items-center">
                        <Spinner />
                        <p className="text-gray-300">Please Wait</p>
                    </div>
                ) : (
                    <>
                        {receives.length != 0 ? (
                            <Table
                                onClickRow={handleOnRowClick}
                                rows={rowsData}
                                columns={columns}
                                tableHeight={323}
                            />
                        ) : (
                            <NoRecord textData={noRecordText} />
                        )}
                    </>
                )}
                <VestingDetails
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    data={modalData}
                    fetchReceiversVestings={fetchReceiversVestings}
                    refreshData={refreshData}
                />
            </section>
        </div>
    )
}
export default ReceiversVesting;