import { useRouter } from "next/router";
import { depositorsQueryById, receiversQueryById } from '../../../utils/queries/subgraphQuery'
import { createClient } from 'urql';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Label } from "../../../design-System/Atom/Label";
import { timeStampToDate } from "../../../utils/dateTime/timestampToDate";
import { secondsToDHMS } from "../../../utils/dateTime/seconds-to-dhms";
import { Modal } from "../../../design-System/Atom/Modal";
import { Button } from "../../../design-System/Atom/Button";
import { revokeVesting } from "../../../infrastructure/smart-contracts/VesterContract";
import { toast } from "react-toastify";
import { Spinner } from "../../../design-System/Atom/Spinner";
import Table from "../../../design-System/Molecules/Table";
import NoRecord from "../../../design-System/Molecules/NoRecord";
import { ethers } from "ethers";
import { getDecimals } from "../../../infrastructure/smart-contracts/ERC20Contract";
export default function DepositScheduleData() {
    const currentAccount = useSelector((state) => state.WalletDataReducer.currentAccount);
    const vesterSubgraphApiUrl = useSelector(
        (state) => state.ChainDataReducer.vesterSubgraphApiUrl,
    );
    const router = useRouter();
    let id = router.query.depositId;
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [revokeLoading, setRevokeLoading] = useState(false);
    const [modalData, setModalData] = useState([]);
    const columns = [
        { heading: "S.No", value: "sNo" },
        { heading: "Receiver", value: "receiver" },
        { heading: "Amount", value: "amount" },
        { heading: "Claimable", value: "Withdrawable" },
        { heading: "Calimed", value: "claimed" },
        { heading: "Status", value: "status" },
        { heading: " view", value: "view" },
    ];
    const btnText = ['Revoke', 'Already Revoked']
    const viewData = () => {
        return (
            <button className="border-2 border-indigo-200 px-2 rounded-md hover:shadow-lg">
                View
            </button>
        );
    }
    const withdrawable = (vesterData, released, amount, revoked) => {
        const currentTime = Date.now() / 1000;
        if (
            currentTime <
            Number(vesterData.start) + Number(vesterData.cliff) || revoked
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
            (cycle * Number(amount) * Number(vesterData.slicePeriod)) /
            Number(vesterData.duration) -
            released;

        return amountReturn;
    };
    const getData = async () => {
        setLoading(true);
        try {
            const client = createClient({
                url: vesterSubgraphApiUrl,
            })

            let deposits = (await client.query(depositorsQueryById(currentAccount, id)).toPromise()).data.vestingSchedules;
            let receiverData = (await client.query(receiversQueryById(id)).toPromise()).data.receivers;
            let rowsData = [];
            if (deposits && receiverData) {
                deposits[0].decimal = await getDecimals(deposits[0].token);
                for (let i = 0; i < receiverData.length; i++) {
                    const e = receiverData[i];
                    const row = {
                        sNo: i + 1,
                        id: id,
                        receiver: e.address,
                        startDate: timeStampToDate(Number(deposits[0].start)),
                        endDate: timeStampToDate(Number(deposits[0].start) + Number(deposits[0].duration)),
                        cliff: secondsToDHMS(Number(deposits[0].cliff)),
                        slicePeriod: secondsToDHMS(Number(deposits[0].slicePeriod)),
                        claimed: ethers.utils.formatEther(e.released, deposits[0].decimal),
                        token: deposits[0].token,
                        amount: ethers.utils.formatUnits(e.amount, deposits[0].decimal),
                        revocable: deposits[0].revocable ? 'Yes' : 'No',
                        status: deposits[0].revocable ? (e.revoked ? 'Revoked' : 'Not Revoked') : 'Not Revocable',
                        revoked: e.revoked,
                        Withdrawable: withdrawable(deposits[0], ethers.utils.formatUnits(e.released, deposits[0].decimal), ethers.utils.formatUnits(e.amount, deposits[0].decimal), e.revoked),
                        view: viewData(),
                    };
                    rowsData.push(row);

                }
                setTableData(rowsData);
            }
        } catch (error) {
            router.push({
                pathname: '/vesting'
            })
        }
        setLoading(false);
    }
    const handleOnRowClick = (data) => {
        setModalData(data);
        setIsModalOpen(true);
    }
    const handleRevoke = async (receiver) => {
        setRevokeLoading(true);
        try {
            const tx = await revokeVesting(id, receiver)
            toast.success("Revoking: Transaction is placed, wait till it gets confirmed on blockchain");
            await tx.wait();
            toast.success("Revoked Sucessfully!!!")
            setTimeout(() => {
                setRevokeLoading(false);
                getData();
                setIsModalOpen(false);
            }, 3000)
        } catch (error) {
            setRevokeLoading(false);
            if (error.code === 4001) {
                toast.error('User denied transaction signature');
            } else {
                console.log(error);
                toast.error('Transation Failed');
            }
        }
    }
    useEffect(() => {
        if (currentAccount == '') {
            router.push({ pathname: '/vesting' })
        }
        else {
            getData();
        }
    }, [vesterSubgraphApiUrl, currentAccount]);

    return (
        <div className='p-3'><Label className="text-center py-2 text-2xl font-bold  mb-0.5">
            Vesting Schedule Data
        </Label><section className="container   mx-auto justify-center items-center  ">
                {loading ? (
                    <div className="flex flex-col justify-center items-center">
                        <Spinner />
                        <p className="text-gray-300">Please Wait</p>
                    </div>
                ) : (
                    <>
                        {tableData.length != 0 ? (
                            <Table
                                onClickRow={handleOnRowClick}
                                rows={tableData}
                                columns={columns}
                                tableHeight={323}
                            />
                        ) : (
                            <NoRecord textData={['No Vesting Deposit Available', 'You have not created any vesting schedule yet.']} />
                        )}
                    </>
                )}
                {isModalOpen ? <>
                    <Modal label={"Vesting Schedule"} open={isModalOpen} setOpen={setIsModalOpen}>
                        <div className="space-y-3 ">
                            <table className="border-separate lg:border-spacing-7 ">
                                <tbody>
                                    <tr>
                                        <th className="text-start">Vesting Id </th>
                                        <td>:</td>
                                        <td>{modalData.id}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">Token </th>
                                        <td>:</td>
                                        <td>{modalData.token}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">Vested Amount </th>
                                        <td>:</td>
                                        <td>{modalData.amount}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">Start Date </th>
                                        <td>:</td>
                                        <td>{modalData.startDate}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">End Date</th>
                                        <td>:</td>
                                        <td>{modalData.endDate}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start ">Slice Period </th>
                                        <td>:</td>
                                        <td>{modalData.slicePeriod}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start ">Cliff Duration </th>
                                        <td>:</td>
                                        <td>{modalData.cliff}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start ">Claimable Amount </th>
                                        <td>:</td>
                                        <td>{modalData.Withdrawable}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">Revocable </th>
                                        <td>:</td>
                                        <td>{modalData.revocable}</td>
                                    </tr>
                                    <tr>
                                        <th className="text-start">Revoked </th>
                                        <td>:</td>
                                        <td>{modalData.status}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="text-center">
                                <Button onClick={() => { handleRevoke(modalData.receiver) }} loading={revokeLoading} disabled={modalData.revoked || modalData.status == 'Not Revocable'}>
                                    {modalData.status == 'Not Revocable' ? 'Not Revocable' : modalData.revoked ? btnText[1] : btnText[0]}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </> : <></>}
            </section></div >
    );
}
