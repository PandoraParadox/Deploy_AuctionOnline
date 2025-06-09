"use client";
import { useEffect, useState } from "react";
import {
    RightIcon,
    TranHisIcon,
    AvaiIcon,
    PendingIcon,
    WalletIcon,
    MoneyOut
} from "@/icon";
import { WalletMinimal, Coins, History } from 'lucide-react';
import { useAuth } from "@/component/auth/authContext";
import AddFunds from "../walletmodal/AddFund";
import WithdrawFunds from "../walletmodal/Withdrawl";
interface Transaction {
    id: number,
    type: 'Add Funds' | 'Bids' | 'Withdrawal' | 'Confirm',
    description: string,
    amount: number,
    created_at?: Date,
}

interface Wallet {
    balance: number;
    pending_bids: number;
}
interface PendingItem {
    won_item_id: number;
    product_id: number;
    name: string;
    final_price: number;
    status: string;
    won_at: string;
    payment_due: string;
    images: string;
    created_at: string;
}

export default function Wallet() {
    const [wallet, setWallet] = useState<Wallet>();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [originTrans, setOriginTrans] = useState<Transaction[]>([]);
    const { user } = useAuth();
    const [isAddFund, setIsAddFund] = useState(false);
    const [isWithDrawl, setIsWithDrawl] = useState(false);
    const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);


    useEffect(() => {
        if (!user) {
            console.log("Please login to view your won items.", { toastId: "auth-error" });
            return;
        }

        const fetchPendingItems = async () => {
            const token = await user.getIdToken();
            const res = await fetch(`http://localhost:5000/won-items/pendingItem/${user.uid}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPendingItems(data);
            } else {
                console.log("Failed to fetch pending items");
            }
        };

        const fetchWallet = async () => {
            const token = await user.getIdToken();
            try {
                const dataWallet = await fetch(`http://localhost:5000/api/v1/wallet/${user.uid}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!dataWallet.ok) {
                    const err = await dataWallet.json().catch(() => ({}));
                    throw new Error(err || dataWallet.status);
                }
                const parseDataWallet = await dataWallet.json();
                setWallet(parseDataWallet);

                const dataTrans = await fetch(`http://localhost:5000/api/v1/wallet/transactions/${user.uid}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!dataTrans.ok) {
                    const err = await dataTrans.json().catch(() => ({}));
                    throw new Error(err || dataTrans.status);
                }
                const parseDataTrans = await dataTrans.json();
                setTransactions(parseDataTrans);
                setOriginTrans(parseDataTrans);
                await fetchPendingItems();
            } catch (err) {
                console.log(err);
            }
        }

        fetchWallet();
    }, [user]);

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    const handleFiller = (type: string) => {
        if (originTrans.length === 0) return;
        if (type === 'add') {
            setTransactions(originTrans.filter((trans) => trans.type === 'Add Funds'))
        } else if (type === 'bids') {
            setTransactions(originTrans.filter((trans) => trans.type === 'Bids'))
        } else if (type === 'withd') {
            setTransactions(originTrans.filter((trans) => trans.type === 'Withdrawal'))
        } else if (type === 'confirm') {
            setTransactions(originTrans.filter((trans) => trans.type === 'Confirm'))
        } else if (type === 'all') {
            setTransactions(originTrans)
        }
    }

    return (
        <div className="min-h-screen pt-12">
            <div className="pt-10 w-[90%] max-w-6xl mx-auto">
                <div className="w-full">
                    <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                    <p className="text-sm text-gray-600 mt-2">Track your transactions, balances, and financial activity</p>
                </div>
            </div>


            <div className="w-[90%] max-w-6xl mx-auto flex flex-col md:flex-row gap-6 py-8">
                <div className="flex-1 rounded-xl shadow-md bg-gradient-to-br from-emerald-400 to-emerald-100 p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-white/30">
                            <WalletMinimal className="w-6 h-6 text-green-800" />
                        </div>
                        <div className="ml-3 text-lg font-medium text-emerald-900">Available Balance</div>
                    </div>
                    <div className="text-4xl mt-4 font-bold text-gray-800">{wallet?.balance !== undefined ? Math.trunc(wallet.balance).toLocaleString('de-DE') : '0'} VND</div>
                    <div className="mt-2 text-sm text-emerald-800">Updated just now</div>
                </div>

                <div className="flex-1 rounded-xl shadow-md bg-gradient-to-br from-blue-400 to-blue-100 p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-white/30">
                            <Coins className="w-6 h-6 text-blue-800" />
                        </div>
                        <div className="ml-3 text-lg font-medium text-blue-900">Pending Bids</div>
                    </div>
                    <div className="text-4xl mt-4 font-bold text-gray-800">{wallet?.pending_bids !== undefined ? Math.trunc(wallet.pending_bids).toLocaleString('de-DE') : '0'} VND</div>
                    <div className="mt-2 text-sm text-blue-800">{pendingItems.length} active bids</div>
                </div>

                <div className="flex-1 rounded-xl shadow-md bg-gradient-to-br from-amber-400 to-amber-100 p-6 transition-all hover:shadow-lg">
                    <h3 className="text-xl font-bold text-amber-900">Quick Actions</h3>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setIsAddFund(true)}
                            className="flex-1 rounded-lg bg-white/80 text-amber-700 flex items-center justify-center gap-2 py-3 px-4 cursor-pointer hover:bg-amber-700 hover:text-white transition-all duration-300 hover:shadow-md"
                        >
                            <AvaiIcon className="w-5 h-5" />
                            <span className="font-semibold">Add Funds</span>
                        </button>
                        <button
                            onClick={() => setIsWithDrawl(true)}
                            className="flex-1 rounded-lg bg-white/80 text-amber-700 flex items-center justify-center gap-2 py-3 px-4 cursor-pointer hover:bg-amber-700 hover:text-white transition-all duration-300 hover:shadow-md">
                            <MoneyOut className="w-5 h-5" />
                            <span className="font-semibold">Withdraw</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-[90%] max-w-6xl mx-auto h-[350px] overflow-x-auto">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Transaction History</h2>
                            <div className="flex gap-3">
                                <select
                                    className="rounded-lg px-4 py-2 text-sm bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    onChange={(e) => handleFiller(e.target.value)}
                                >
                                    <option value='all'>All Transactions</option>
                                    <option value='add'>Add Funds</option>
                                    <option value='bids'>Bids</option>
                                    <option value='withd'>Withdrawals</option>
                                    <option value='confirm'>Confirm Payment</option>
                                </select>
                            </div>
                        </div>

                        <div className="">
                            <div className="min-w-full  overflow-y-auto">
                                <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-t-lg text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-5">Transaction</div>
                                    <div className="col-span-4">Description</div>
                                    <div className="col-span-3 text-right">Amount</div>
                                </div>
                                <div className="max-h-120 md:max-h-96  ">
                                    <ul className="divide-y divide-gray-100">
                                        {transactions.length > 0 ? (
                                            transactions.map((tx, index) => (
                                                <li key={index} className="hover:bg-gray-50 transition-colors">
                                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-4 py-4 items-center">
                                                        <div className="col-span-5 flex items-center">
                                                            <div className={`w-9 h-9 flex items-center justify-center rounded-full mr-3 ${tx.type === 'Bids' ? 'bg-blue-500' : tx.type === 'Add Funds' ? 'bg-green-500' : 'bg-red-500'}`}>
                                                                <History className={`w-5 h-5 text-white`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{tx.type}</p>
                                                                <p className="text-sm text-gray-500 sm:hidden">{tx.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-4 hidden sm:block">
                                                            <p className="text-gray-600">{tx.description}</p>
                                                        </div>
                                                        <div className="col-span-3 flex flex-col sm:items-end">
                                                            <p className={`font-semibold ${tx.type === 'Bids' ? 'text-blue-500' : tx.type === 'Add Funds' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {tx.type === 'Withdrawal' || tx.type === 'Confirm' ? `- ${Math.trunc(tx.amount).toLocaleString('de-DE')} VND` : `+ ${Math.trunc(tx.amount).toLocaleString('de-DE')} VND`}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="py-8 text-center text-gray-500">
                                                No transactions found
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isAddFund && (
                <div className="fixed inset-0 z-50">
                    <AddFunds
                        onClose={() => setIsAddFund(false)}
                    />
                </div>
            )}
            {isWithDrawl && (
                <div className="fixed inset-0 z-50">
                    <WithdrawFunds onClose={() => setIsWithDrawl(false)} />
                </div>
            )}
        </div>
    );
}