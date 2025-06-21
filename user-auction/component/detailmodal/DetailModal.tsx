import React, { useEffect, useState } from 'react';
import { XIcon, TruckIcon, CheckCircleIcon, CalendarIcon, DollarSignIcon, MapPinIcon, ClockIcon, PackageIcon, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../auth/authContext';
import Swal from 'sweetalert2';

interface WonItem {
    id: number;
    productID: number;
    name: string;
    date: Date | string;
    price: number;
    status: 'Pending' | 'Delivered';
    image: string;
    phone?: string;
    address?: string;
    shipping?: string;
    description?: string;
    deliveredDate?: Date | string;
}

interface DetailModalProps {
    item: WonItem;
    onClose: () => void;
}

export default function DetailModal({
    item,
    onClose,
}: DetailModalProps) {
    const { user } = useAuth();
    const [itemDetail, setItemDetail] = useState<WonItem>(item);

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleConfirmReceipt = async () => {
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/won-items/received/${item.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || "Unknown error");
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'You have successfully confirmed receipt of the item.',
                confirmButtonColor: '#10B981',
            }).then(() => {
                onClose();
                window.location.reload();
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an issue confirming receipt. Please try again.',
            });
        }
    };


    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = await user?.getIdToken();
                if (!token) {
                    console.log("User login error");
                    return;
                }

                const detail = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/won-items/payments/${item.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                });

                if (!detail.ok) {
                    const errorData = await detail.json().catch(() => ({}));
                    throw new Error(errorData.error);
                }

                const data = await detail.json();
                const dataMap = {
                    phone: data.phoneNumber,
                    address: data.shipping_address,
                    shipping: data.shipping_method,
                    deliveredDate: data.deliveredTime ? new Date(data.deliveredTime) : undefined,
                    description: data.description,
                };

                setItemDetail((prev) => ({
                    ...prev,
                    ...dataMap,
                }));
            } catch (err) {
                console.log(err);
            }
        };

        fetchDetail();
    }, [item.id, user]);

    return (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl md:w-full w-[90%] max-w-5xl overflow-hidden shadow-2xl">
                <div className="relative">
                    <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-gray-700 z-10 cursor-pointer">
                        <XIcon size={24} />
                    </button>
                    <div className="md:grid grid-cols-12 gap-0">
                        <div className="col-span-5 md:h-[full] h-[80%] flex items-center justify-center">
                            <img
                                src={item.image ? `${process.env.NEXT_PUBLIC_CLOUD_DOMAIN}/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload/${images[0]}.jpg` : "/fallback-image.jpg"}
                                alt={item.name}
                                className="md:w-full md:h-full w-[80%] h-[80%] object-cover "
                            />
                        </div>
                        <div className="col-span-7 p-8">
                            <div className="max-w-2xl">
                                <div className="flex justify-between items-start mb-6 w-[90%]">
                                    <h2 className="text-2xl font-bold text-gray-800 break-words pr-4" style={{ maxWidth: 'calc(100% - 100px)' }}>
                                        {item.name}
                                    </h2>
                                    <span className="bg-[#D9F8E3] text-[#065F46] text-xs font-semibold px-4 py-1 rounded-full mt-1">
                                        {item.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <CalendarIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Auction Won</p>
                                                <p className="font-medium text-xs">
                                                    {formatDate(itemDetail.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <DollarSignIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Final Price</p>
                                                <p className="font-medium text-xs">
                                                    {Math.trunc(itemDetail.price).toLocaleString('de-DE')} VND
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <ClockIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Delivery Time</p>
                                                <p className="font-medium text-xs">
                                                    {`Delivered on ${formatDate(itemDetail.deliveredDate)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <PackageIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Shipping Method</p>
                                                <p className="font-medium text-xs">
                                                    {itemDetail.shipping}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPinIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Delivered To</p>
                                                <p className="font-medium text-xs">
                                                    {itemDetail.address}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <TruckIcon size={16} className="text-blue-600 mr-3 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone Number</p>
                                                <p className="font-medium text-xs">
                                                    {itemDetail.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="md:block hidden bg-gray-100 p-6 rounded-xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Item Details
                                            </h3>
                                        </div>
                                        <div className="space-y-4 overflow-x-auto h-[100px]">
                                            <p className="text-gray-600 text-xs">
                                                {itemDetail.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleConfirmReceipt}
                                            className="bg-green-600 hover:bg-blue-700 text-white text-base font-light py-1 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 cursor-pointer mx-auto"
                                        >
                                            <CheckCircleIcon size={16} />
                                            Confirm Receipt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
