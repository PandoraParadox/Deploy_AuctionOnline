"use client"
import { useEffect, useState } from "react";
import {
    RightIcon,
    TranHisIcon,
    AvaiIcon,
    PendingIcon,
    WalletIcon,
    MoneyOut
} from "@/icon";
import { useAuth } from "@/component/auth/authContext";
import { BuildingIcon, CheckCircleIcon, AlertCircleIcon, XIcon, Loader2, Link2Icon, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

interface WalletModalProps {
    onClose: () => void;
}

type PaymentMethod = 'VNPAY Qr Code' | 'VNPAY Payment Link';
type PaymentStatus = 'Success' | 'Failed' | 'Pending';
type PaymentStep = 'method' | 'details' | 'processing' | 'complete';

export default function AddFunds({ onClose }: WalletModalProps) {
    const { user } = useAuth();
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('VNPAY Qr Code');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [vnpayQr, setVnpayQr] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [txnRef, setTxnRef] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.status) {
                setPaymentStep('complete');
                setPaymentStatus(event.data.status === 'success' ? 'Success' : 'Failed');
                if (event.data.status === 'failed' && event.data.code) {
                    console.log('VNPAY Response Code:', event.data.code);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleMethodSelect = async (method: PaymentMethod) => {
        if (!amount || isNaN(Number(amount)) || isNaN(parseFloat(amount))) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid amount'
            });
            return;
        }

        setSelectedMethod(method);
        setPaymentStep('details');

        try {
            const token = await user?.getIdToken(true);
            const res = await fetch("http://localhost:5000/api/v1/vnpay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description: description,
                    user_id: user?.uid
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            setVnpayQr(data.qr_url);
            setPaymentUrl(data.payment_url);
            setTxnRef(data.vnp_TxnRef);
        } catch (error) {
            console.log("Failed to load payment info:", error);
            setPaymentStep('method');
        }
    };
    const formatCurrency = (value: number | string): string => {
        const number = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN').format(number);
    };


    const checkTransactionStatus = async (txnRef: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const token = await user?.getIdToken(true);
            const res = await fetch(`http://localhost:5000/api/v1/vnpay/transaction_status/${txnRef}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            return data.vnp_ResponseCode === '00';
        } catch (error) {
            clearTimeout(timeoutId);
            console.log('Error checking transaction status:', error);
            return false;
        }
    };

    const saveTransaction = async () => {
        const token = await user?.getIdToken(true);
        try {

            const res = await fetch(`http://localhost:5000/api/v1/wallet/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: user?.uid,
                    type: 'Add Funds',
                    amount: parseFloat(amount),
                    description: description,
                }),
            });
            if (!res.ok) {
                console.log('save transaction fail');
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            setPaymentStatus('Success');

        } catch (err) {
            console.log('Error saving transaction:', err);
            setPaymentStatus('Failed');
        } finally {
            setPaymentStep('complete');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentStep('processing');

        if (selectedMethod === 'VNPAY Payment Link' && paymentUrl) {
            window.open(paymentUrl, '_blank');
        }

        if (txnRef) {
            const maxAttempts = 15;
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                const isSuccess = await checkTransactionStatus(txnRef);
                if (isSuccess) {
                    await saveTransaction();
                    clearInterval(interval);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setPaymentStatus('Failed');
                    setPaymentStep('complete');
                }
            }, 5000);
        } else {
            setPaymentStatus('Failed');
            setPaymentStep('complete');
        }
    };

    return (
        <div className="min-h-screen pt-12">
            <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-xl space-y-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>

                    {paymentStep === 'method' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Add Funds to Wallet
                            </h3>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Amount (VND)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description for this transaction"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                />
                            </div>

                            <div className="pt-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                                    Select Payment Method
                                </h4>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleMethodSelect('VNPAY Qr Code')}
                                        className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedMethod === 'VNPAY Qr Code' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                    >
                                        <QrCode className="text-blue-600" size={20} />
                                        <div className="text-left flex-1">
                                            <div className="font-semibold">VNPAY QR Code</div>
                                            <div className="text-gray-600 text-xs">Scan QR code to pay with VNPAY</div>
                                        </div>
                                        {selectedMethod === 'VNPAY Qr Code' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                    </button>

                                    <button
                                        onClick={() => handleMethodSelect('VNPAY Payment Link')}
                                        className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedMethod === 'VNPAY Payment Link' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                    >
                                        <Link2Icon className="text-blue-600" size={20} />
                                        <div className="text-left flex-1">
                                            <div className="font-semibold">VNPAY Payment Link</div>
                                            <div className="text-gray-600 text-xs">Pay via VNPAY payment page</div>
                                        </div>
                                        {selectedMethod === 'VNPAY Payment Link' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentStep === 'details' && (
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-sm">
                                <button
                                    onClick={() => setPaymentStep('method')}
                                    className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    Back
                                </button>
                                <span className="text-gray-400">|</span>
                                <span className="font-medium">{selectedMethod}</span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-800">Payment Summary</h4>
                                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-medium">{amount} VND</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">{selectedMethod}</span>
                                    </div>
                                    {description && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Description:</span>
                                            <span className="font-medium">{description}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {selectedMethod === 'VNPAY Payment Link' ? (
                                    <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                                        <h4 className="font-semibold text-sm mb-4">VNPAY Payment</h4>
                                        <div className="space-y-4">
                                            <p className="text-gray-600 text-sm">
                                                Click the link below to proceed to VNPAY payment page.
                                            </p>
                                            {paymentUrl ? (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <a
                                                        href={paymentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-700 underline text-sm"
                                                    >
                                                        Go to VNPAY Payment Page
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Loading payment link...</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="bg-gray-50 p-6 rounded-xl mb-6">
                                            <p className="text-gray-600 mb-4">Scan QR code to pay with VNPAY</p>
                                            {vnpayQr ? (
                                                <QRCodeSVG value={vnpayQr} size={256} className="mx-auto mb-6" />
                                            ) : (
                                                <p className="text-sm text-gray-500">Loading VNPAY QR code...</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 space-y-3">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                    >
                                        {selectedMethod === 'VNPAY Payment Link' ? 'Proceed to Payment' : 'Confirm Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {paymentStep === 'processing' && (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-6" />
                            <p className="text-xl text-gray-700 font-medium">
                                Processing your payment
                            </p>
                            <p className="text-gray-500 mt-2">
                                Please do not close this window.
                            </p>
                        </div>
                    )}

                    {paymentStep === 'complete' && (
                        <div className="text-center py-8">
                            {paymentStatus === 'Success' ? (
                                <>
                                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Payment Complete!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {formatCurrency(amount)} VND has been added to your wallet balance.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Payment Failed
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        There was an issue processing your payment. Please try again.
                                    </p>
                                </>
                            )}
                            <button
                                onClick={() => { window.location.reload(); }}
                                className={`w-full font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer ${paymentStatus === 'Success' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                                {paymentStatus === 'Success' ? 'Back to Wallet' : 'Try Again'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}