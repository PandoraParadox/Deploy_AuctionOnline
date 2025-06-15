"use client";
import { useState } from "react";
import { WalletIcon, BuildingIcon, CheckCircleIcon, AlertCircleIcon, XIcon, Loader2 } from 'lucide-react';
import { useAuth } from "@/component/auth/authContext";

interface WalletModalProps {
    onClose: () => void;
}

type WithdrawalMethod = 'Bank Transfer' | 'Momo';
type WithdrawalStatus = 'Success' | 'Failed' | 'Pending';
type WithdrawalStep = 'method' | 'details' | 'processing' | 'complete';

export default function WithdrawFunds({ onClose }: WalletModalProps) {
    const { user } = useAuth();
    const [withdrawalStep, setWithdrawalStep] = useState<WithdrawalStep>('method');
    const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>('Bank Transfer');
    const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus>('Pending');
    const [amount, setAmount] = useState<string>('');
    const [accountInfo, setAccountInfo] = useState({
        accountNumber: '',
        accountName: '',
        bankName: '',
        note: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) {
            alert('Please enter a valid amount');
            return;
        }
        setWithdrawalStep('processing');

        const fetchWallet = async () => {
            const token = await user?.getIdToken(true);
            try {
                const data = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/api/v1/wallet/transaction`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user?.uid,
                        type: 'Withdrawal',
                        amount: parseFloat(amount),
                        description: `${accountInfo.note}`,
                    })
                });
                if (!data.ok) {
                    const error = await data.json().catch(() => ({}));
                    throw new Error(error || data.status);
                }
                setWithdrawalStatus('Success')
            } catch (err) {
                console.log(err);
                setWithdrawalStatus('Failed')
            } finally {
                setWithdrawalStep('complete')
            }
        }
        fetchWallet();
    };

    const handleMethodSelect = (method: WithdrawalMethod) => {
        setSelectedMethod(method);
        setWithdrawalStep('details');
    };

    const handleAccountInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAccountInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const formatCurrency = (value: number | string): string => {
        const number = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    return <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-xl space-y-6 relative">
            <button
                onClick={() => {
                    onClose();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
                <XIcon className="w-5 h-5" />
            </button>

            {withdrawalStep === 'method' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Withdraw Funds
                    </h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Amount (VND)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount to withdraw"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            step="0.01"
                        />
                    </div>

                    <div className="pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">
                            Select Withdrawal Method
                        </h4>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleMethodSelect('Bank Transfer')}
                                className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedMethod === 'Bank Transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                <BuildingIcon className="text-blue-600" size={20} />
                                <div className="text-left flex-1">
                                    <div className="font-semibold">Bank Transfer</div>
                                    <div className="text-gray-600 text-xs">Transfer to your bank account</div>
                                </div>
                                {selectedMethod === 'Bank Transfer' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                            </button>

                            <button
                                onClick={() => handleMethodSelect('Momo')}
                                className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedMethod === 'Momo' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                <WalletIcon className="text-pink-600" size={20} />
                                <div className="text-left flex-1">
                                    <div className="font-semibold">Momo Wallet</div>
                                    <div className="text-gray-600 text-xs">Transfer to your Momo account</div>
                                </div>
                                {selectedMethod === 'Momo' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {withdrawalStep === 'details' && (
                <div>
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <button
                            onClick={() => setWithdrawalStep('method')}
                            className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Back
                        </button>
                        <span className="text-gray-400">|</span>
                        <span className="font-medium">{selectedMethod}</span>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800">Withdrawal Summary</h4>
                        <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-medium">{amount} VND</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium">{selectedMethod}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {selectedMethod === 'Bank Transfer' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={accountInfo.bankName}
                                        onChange={handleAccountInfoChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={accountInfo.accountNumber}
                                        onChange={handleAccountInfoChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Account Name</label>
                                    <input
                                        type="text"
                                        name="accountName"
                                        value={accountInfo.accountName}
                                        onChange={handleAccountInfoChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Momo Phone Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={accountInfo.accountNumber}
                                        onChange={handleAccountInfoChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-4 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                            <textarea
                                name="note"
                                value={accountInfo.note}
                                onChange={handleAccountInfoChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={2}
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Confirm Withdrawal
                        </button>
                    </form>
                </div>
            )}

            {withdrawalStep === 'processing' && (
                <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-6" />
                    <p className="text-xl text-gray-700 font-medium">
                        Processing your withdrawal
                    </p>
                    <p className="text-gray-500 mt-2">
                        Please do not close this window.
                    </p>
                </div>
            )}

            {withdrawalStep === 'complete' && (
                <div className="text-center py-8">
                    {withdrawalStatus === 'Success' ? (
                        <>
                            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Withdrawal Successful!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {formatCurrency(amount)} VND will be transferred to your {selectedMethod} account within 24 hours.
                            </p>
                        </>
                    ) : (
                        <>
                            <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Withdrawal Failed
                            </h3>
                            <p className="text-gray-600 mb-6">
                                There was an issue processing your withdrawal. Please try again.
                            </p>
                        </>
                    )}
                    <button
                        onClick={() => {
                            window.location.reload();
                        }}
                        className={`w-full font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer ${withdrawalStatus === 'Success' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {withdrawalStatus === 'Success' ? 'Back to Wallet' : 'Try Again'}
                    </button>
                </div>
            )}
        </div>
    </div>

}