import React, { useEffect, useState } from 'react';
import { XIcon, WalletIcon, CheckCircleIcon, AlertCircleIcon, TruckIcon, HomeIcon, BuildingIcon, MapPinIcon, FolderMinus } from 'lucide-react';
import { useAuth } from '../auth/authContext';

interface WonItem {
    id: number;
    productID: number;
    name: string;
    date: Date;
    price: number;
    status: 'Pending' | 'Delivered';
    image: string;
}
interface PaymentModalProps {
    item: WonItem;
    onClose: () => void;
}
type ShippingMethod = 'Standard' | 'Express' | 'Pickup';
type PaymentStatus = 'Success' | 'Failed' | 'Pending';
type PaymentStep = 'shipping' | 'details' | 'processing' | 'complete';
export default function PaymentModal({
    item,
    onClose,

}: PaymentModalProps) {
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('shipping');
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('Standard');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        country: '',
        phone: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        if (paymentStatus === 'Success') {
            const FAdress = `${formData.address}, ${formData.city}, ${formData.country}`
            const confirmPayment = async () => {
                try {
                    const token = await user?.getIdToken(true);
                    if (!token) {
                        throw new Error('Invalid token');
                    }
                    const response = await fetch(`http://localhost:5000/won-items/confirm/${item.productID}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            id: item.id,
                            address: FAdress,
                            shipMethod: shippingMethod,
                            phone: formData.phone,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || 'Payment fail');
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (err) {
                    console.log('Payment error:', err);
                    setPaymentStatus('Failed');
                }
            };

            confirmPayment();
        }
    }, [paymentStatus, item, user]);
    const handleShippingMethodSelect = (method: ShippingMethod) => {
        setShippingMethod(method);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            name,
            value
        } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const isFormValid = () => {
        return (
            formData.address.trim() &&
            formData.city.trim() &&
            formData.country.trim() &&
            formData.phone.trim()
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
            alert("Please fill out all shipping details.");
            return;
        }
        setPaymentStep('processing');

        const fetchWallet = async () => {
            const token = await user?.getIdToken(true);
            try {
                const data = await fetch(`http://localhost:5000/api/v1/wallet/transaction`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user?.uid,
                        type: 'Confirm',
                        amount: item.price + getShippingPrice(shippingMethod),
                        description: `Comfirm payment: ${item.name}`,
                    })
                });
                if (!data.ok) {
                    const error = await data.json().catch(() => ({}));
                    throw new Error(error || data.status);
                }
                setPaymentStatus('Success');
            } catch (err) {
                console.log(err);
                setPaymentStatus('Failed')
            } finally {
                setPaymentStep('complete')
            }
        }
        fetchWallet();
    };
    const getShippingPrice = (method: ShippingMethod) => {
        switch (method) {
            case 'Express':
                return 25;
            case 'Standard':
                return 10;
            case 'Pickup':
                return 2;
            default:
                return 0;
        }
    };
    return <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="relative">
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-gray-700 cursor-pointer">
                    <XIcon size={24} />
                </button>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-3">
                        <img src={item.image ? `http://localhost:5000/uploads/${item.image}` : "/fallback-image.jpg"} alt={item.name} className="w-15 h-15 object-cover rounded-lg" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                Complete Purchase
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {item.name} - {Math.trunc(item.price).toLocaleString('de-DE')} VND
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            {paymentStep === 'shipping' && <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Shipping Information
                                </h3>
                                <div className="space-y-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Enter your street address" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 text-xs" placeholder="City" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full p-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Country" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Enter your phone number" required />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                    Shipping Method
                                </h3>
                                <div className="space-y-3">
                                    {(['Standard', 'Express', 'Pickup'] as ShippingMethod[]).map(method => <button key={method} onClick={() => handleShippingMethodSelect(method)} className={`w-full p-2 border-2 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${shippingMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <TruckIcon className={`ml-2 ${shippingMethod === method ? 'text-blue-600 ' : 'text-gray-400'}`} size={17} />
                                        <div className="text-left flex-1">
                                            <div className="font-medium text-sm">{method}</div>
                                            <div className="text-xs  text-gray-600">
                                                {method === 'Express' ? '1-2 business days' : method === 'Standard' ? '3-5 business days' : 'Pick up at our location'}
                                            </div>
                                        </div>
                                        <div className="font-medium text-xs">
                                            {getShippingPrice(method) === 0 ? 'Free' : `$${getShippingPrice(method)}`}
                                        </div>
                                    </button>)}
                                </div>
                                <button onClick={handleSubmit} type='submit' className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-xl mt-6 hover:bg-blue-700 transition-colors text-sm cursor-pointer">
                                    Continue to Payment
                                </button>
                            </div>}
                            {paymentStep === 'processing' && <div className="text-center py-20 text-sm">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                                <p className="text-xl text-gray-700 font-medium">
                                    Processing your payment
                                </p>
                                <p className="text-gray-500 mt-2">
                                    Please do not close this window.
                                </p>
                            </div>}
                            {paymentStep === 'complete' && <div className="text-center py-20 text-sm">
                                {paymentStatus === 'Success' ? <>
                                    <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Payment Complete!
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        Your payment for {item.name} has been processed successfully.
                                    </p>
                                </> : <>
                                    <AlertCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Payment Failed
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        There was an issue processing your payment. Please try again.
                                    </p>
                                </>}
                                <button onClick={paymentStatus === 'Success' ? onClose : () => setPaymentStep('shipping')} className={` font-medium py-2 px-8 rounded-xl transition-colors cursor-pointer ${paymentStatus === 'Success' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                    {paymentStatus === 'Success' ? 'Close' : 'Try Again'}
                                </button>
                            </div>}
                        </div>
                        <div className="col-span-1">
                            <div className="bg-gray-50 p-6 rounded-xl sticky top-8">
                                <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                                    Order Summary
                                </h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Item Price</span>
                                        <span>{Math.trunc(item.price).toLocaleString('de-DE')} VND</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>{getShippingPrice(shippingMethod)} VND</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>
                                                {(Math.trunc(item.price) + getShippingPrice(shippingMethod)).toLocaleString('de-DE')} VND
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {paymentStep !== 'complete' && <div className="mt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="text-gray-400 mt-1" size={15} />
                                        <div>
                                            <p className="font-medium text-xs">Delivery Address</p>
                                            <p className="text-xs text-gray-600">
                                                {formData.address ? <>
                                                    {formData.address}
                                                    <br />
                                                    {formData.city} {formData.country}
                                                </> : 'No address provided yet'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <TruckIcon className="text-gray-400 mt-1" size={15} />
                                        <div>
                                            <p className="font-medium text-xs">Shipping Method</p>
                                            <p className="text-xs text-gray-600">
                                                {shippingMethod}
                                            </p>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}