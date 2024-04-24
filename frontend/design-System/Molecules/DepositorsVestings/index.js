import { Label } from '../../Atom/Label';
import { Spinner } from "../../Atom/Spinner";
import { timeStampToDate } from '../../../utils/dateTime/timestampToDate';
import { secondsToDHMS } from '../../../utils/dateTime/seconds-to-dhms';
import { Image } from "../../Atom/Image";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import NoRecord from "../../Molecules/NoRecord";
import Table from "../../Molecules/Table";
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
const DepositorsVesting = ({ deposites, loading }) => {
    const [rowsData, setRowsData] = useState([]);
    const chainData = useSelector((state) => state).ChainDataReducer;
    const router = useRouter();
    const columns = [
        { heading: "S.no", value: "sNo" },
        { heading: "Token", value: "tokenSymbol" },
        { heading: "Receivers", value: "noOfReceivers" },
        { heading: "Total Amount", value: "totalAmount" },
        { heading: "Start Date", value: "startDate" },
        { heading: "End Date", value: "endDate" },
        { heading: "Revocable", value: "revocable" },
        { heading: " ", value: "view" },
    ];
    const noRecordText = ['No Vesting Deposits Available', 'You have not created any vesting schedule yet.'];
    const viewData = () => {
        return (
            <button className="border-2 border-indigo-200 px-2 rounded-md hover:shadow-lg">
                View
            </button>
        );
    }
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
    useEffect(() => {
        let tempData = [];
        for (let i = 0; i < deposites.length; i++) {
            const e = deposites[i];
            const row = {
                sNo: i + 1,
                id: e.vestingId,
                startDate: timeStampToDate(Number(e.start)),
                endDate: timeStampToDate(Number(e.start) + Number(e.duration)),
                noOfReceivers: e.receivers.length,
                totalAmount: ethers.utils.formatUnits(e.totalAmount, e.decimal),
                cliff: secondsToDHMS(Number(e.cliff)),
                slicePeriod: secondsToDHMS(Number(e.slicePeriod)),
                token: e.token,
                tokenSymbol: getTokenSymbol(e.symbol),
                revocable: e.revocable ? 'Yes' : 'No',
                view: viewData(),
            };
            tempData.push(row);
        }
        setRowsData(tempData);
    }, [deposites])
    const handleOnRowClick = (data) => {
        router.push({
            pathname: '/vesting/[depositId]',
            query: { depositId: data.id },
        })
    }

    return (
        <div className='p-3'>
            <section className="container   mx-auto justify-center items-center  ">
                <Label className="text-left py-2 text-3xl font-bold  mb-0.5">
                    Deposits
                </Label>
                {loading ? (
                    <div className="flex flex-col justify-center items-center">
                        <Spinner />
                        <p className="text-gray-300">Please Wait</p>
                    </div>
                ) : (
                    <>
                        {deposites.length != 0 ? (
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
            </section></div>
    )
}
export default DepositorsVesting;