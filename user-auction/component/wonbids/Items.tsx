"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { RightIcon } from "@/icon";
import Link from "next/link";
import DetailModal from "../detailmodal/DetailModal";
import PaymentModal from "../paymentmodal/PaymentModal";
import { useAuth } from "@/component/auth/authContext";

interface WonItem {
    id: number;
    productID: number;
    name: string;
    date: Date;
    price: number;
    status: "Pending" | "Delivered";
    payment_due: Date,
    created_at: Date,
    image: string;
}

export default function Items() {
    const { user } = useAuth();
    const [items, setItems] = useState<WonItem[]>([]);
    const [originalItems, setOriginalItems] = useState<WonItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<WonItem | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchWonItems = async () => {
            try {
                setLoading(true);
                const token = await user.getIdToken(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/won-items/${user.uid}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("Won items data:", data);
                setItems(data);
                setOriginalItems(data);
            } catch (error) {
                console.error("Error fetching won items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWonItems();
    }, [user]);

    const handleItemAction = (item: WonItem) => {
        setSelectedItem(item);
        if (item.status === "Pending") {
            setIsPaymentModalOpen(true);
        } else {
            setIsDetailModalOpen(true);
        }
    };

    const handleFilterChange = ({ sort }: { sort: string }) => {
        if (sort === "paymentDue") {
            setItems(originalItems.filter((item) => item.status === "Pending"));
        } else if (sort === "paid") {
            setItems(originalItems.filter((item) => item.status === "Delivered"));
        } else if (sort === "all") {
            setItems([...originalItems]);
        }
    };

    if (loading) {
        return <div className="text-center p-6">Loading...</div>;
    }

    return (
        <div>
            <div className="pt-35 w-[90%] m-auto flex flex-col md:flex-row items-center justify-between">
                <div className="w-full w-auto mb-4 md:mb-0">
                    <div className="text-3xl font-extrabold">Won Auction Items</div>
                    <div className="text-sm text-[#606975] mt-2">
                        Manage your account and track your transactions
                    </div>
                </div>
                <div className="flex gap-3 items-center text-sm md:mt-0 mt-10">
                    <button
                        className="w-[120px] h-[30px] rounded-md bg-[#5C6BC0] font-sm cursor-pointer text-white hover:text-black hover:border border-[#5C6BC0] hover:bg-white duration-200 hover:scale-105"
                        onClick={() => handleFilterChange({ sort: "all" })}
                    >
                        All Items
                    </button>
                    <button
                        className="w-[120px] h-[30px] rounded-md bg-[#5C6BC0] font-sm cursor-pointer text-white hover:text-black hover:border border-[#5C6BC0] hover:bg-white duration-200 hover:scale-105"
                        onClick={() => handleFilterChange({ sort: "paymentDue" })}
                    >
                        Pending
                    </button>
                    <button
                        className="w-[120px] h-[30px] rounded-md bg-[#5C6BC0] font-sm cursor-pointer text-white hover:text-black hover:border border-[#5C6BC0] hover:bg-white duration-200 hover:scale-105"
                        onClick={() => handleFilterChange({ sort: "paid" })}
                    >
                        Paid
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto flex gap-15 mt-10 h-[500px] mx-auto pt-[20px] px-[20px]">
                {items.length === 0 ? (
                    <div className="text-center w-full">No won items found.</div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="min-w-[316px] rounded-2xl bg-white h-[400px] shadow-2xl hover:scale-105 duration-300"
                        >
                            <div className="w-full h-[45%] relative mb-2">
                                <Image
                                    src={item.image ? `${process.env.NEXT_PUBLIC_APP_API_URL}/uploads/${item.image}` : "/fallback-image.jpg"}
                                    width={200}
                                    height={200}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <div
                                    className={`absolute top-3 right-3 text-xs text-[#606975] rounded-xl font-semibold text-[#92400E] p-1 px-3 ${item.status === "Pending" ? "bg-[#FEF3C7]" : "bg-[#D9F8E3]"}`}
                                >
                                    {item.status === "Pending" ? "Pending" : "Delivered"}
                                </div>
                            </div>
                            <div className="w-[90%] mx-auto">
                                <div className="text-xl font-bold mb-1 text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">{item.name}</div>
                                <div className="text-sm font-semibold text-[#6865FF] mb-3">
                                    Won on {new Date(item.date).toLocaleDateString()}
                                </div>
                                <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                    <div>Final Price</div>
                                    <div>{Math.trunc(item.price).toLocaleString('de-DE')} VND</div>
                                </div>
                                <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                    <div>Payment Status</div>
                                    <div>{item.status === "Pending" ? "Pending" : "Paid"}</div>
                                </div>
                                <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                    <div>{item.status === "Pending" ? "Payment Due" : "Delivery Date"}</div>
                                    <div>{item.status === "Pending" ? new Date(item.created_at).toLocaleDateString() : new Date(item.payment_due).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleItemAction(item)}
                                className={`p-2 w-[95%] rounded-lg text-sm block mx-auto cursor-pointer duration-400 ${item.status === "Pending"
                                    ? "bg-[#4F46E5] text-white hover:text-[#4F46E5] hover:bg-white hover:border"
                                    : "bg-white text-gray-500 border hover:text-white hover:bg-gray-500"
                                    }`}
                            >
                                {item.status === "Pending" ? "Complete Payment" : "View Details"}
                            </button>
                        </div>
                    ))
                )}
            </div>
            {selectedItem && (
                <>
                    {isPaymentModalOpen && <PaymentModal item={selectedItem} onClose={() => setIsPaymentModalOpen(false)} />}
                    {isDetailModalOpen && <DetailModal item={selectedItem} onClose={() => setIsDetailModalOpen(false)} />}
                </>
            )}
        </div>
    );
}