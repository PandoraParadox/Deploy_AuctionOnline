"use client";
import { Clock } from 'lucide-react';
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RightIcon, ClockBidIcon } from "@/icon";
import { ChevronRight } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    startingPrice: string;
    category: string;
    images: string;
    auctionTime?: string;
    highest_bid: string;
}

export default function Auction() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [bidderCounts, setBidderCounts] = useState<Record<number, number>>({});

    const fetchBidderCount = async (productId: number): Promise<number> => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/bidder/${productId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const count = await response.json();
            return Number(count) || 0;
        } catch (error) {
            console.error(`Error fetching bidder count for product ${productId}:`, error);
            return 0;
        }
    };

    useEffect(() => {
        const fetchAllBidderCounts = async () => {
            const counts: Record<number, number> = {};

            const promises = products.map(async (product) => {
                counts[product.id] = await fetchBidderCount(product.id);
            });

            await Promise.all(promises);
            setBidderCounts(counts);
        };

        if (products.length > 0) {
            fetchAllBidderCounts();
        }
    }, [products]);

    const getAuctionStatus = (auctionTime?: string): string => {
        const now = new Date();
        const startTime = auctionTime ? new Date(auctionTime) : new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const diffStartMs = startTime.getTime() - now.getTime();
        const diffEndMs = endTime.getTime() - now.getTime();

        if (diffStartMs > 0) {
            return "Coming Soon";
        } else if (diffEndMs > 0) {
            const minutes = Math.floor(diffEndMs / (1000 * 60));
            const seconds = Math.floor((diffEndMs % (1000 * 60)) / 1000);
            return `${minutes}m ${seconds}s`;
        } else {
            return "End of Auction";
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/v1/products", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const { data }: { data: Product[] } = await response.json();
            console.log("Fetched products:", data);

            const parsedData = data.map((product: Product) => ({
                ...product,
                images: typeof product.images === "string" ? JSON.parse(product.images) : product.images || [],
            }));

            setProducts(parsedData);
            setLoading(false);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.log("Fetch failed:", errorMessage);
            setError(errorMessage);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        const interval = setInterval(() => {
            setProducts((prevProducts) => [...prevProducts]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <style jsx>{`
                @keyframes dropDown {
                    0% {
                        transform: translateY(-100px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .animate-drop-down {
                    animation: dropDown 0.5s ease-out forwards;
                }

                .grid-item {
                    opacity: 0;
                }
                .grid-item:nth-child(1) { animation-delay: 0.1s; }
                .grid-item:nth-child(2) { animation-delay: 0.2s; }
                .grid-item:nth-child(3) { animation-delay: 0.3s; }
                .grid-item:nth-child(4) { animation-delay: 0.4s; }
            `}</style>

            <div className="pt-22 w-[90%] md:w-[70%] m-auto flex">
                <div className="w-full">
                    <div className="text-2xl md:text-3xl font-extrabold">Featured Auctions</div>
                    <div className="text-sm text-[#606975] mt-2">
                        Discover our most exceptional items up for auction
                    </div>
                </div>
                <Link
                    href="/auctionpage"
                    className="text-xs flex items-center justify-center mt-5 px-7 py-1 bg-[#F8F1E5] md:bg-white text-[#3C35A5] border border-[#3C35A5] font-medium rounded-lg hover:bg-[#3C35A5] hover:text-white transition-colors duration-300 shadow-sm hover:shadow-md"
                >
                    View All
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 hover:translate-x-1" />
                </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-2 md:w-[71%] m-auto mt-2">
                {products.length === 0 ? (
                    <div className="text-center w-full col-span-4 mx-auto text-2xl">
                        {loading ? "Loading..." : "No items found."}
                    </div>
                ) : (products.slice(0, 8).map((item: Product, index: number) => {
                    const images: string[] = Array.isArray(item.images) ? item.images : [];
                    const imageUrl = images.length > 0 ? `/api/images/${images[0]}` : "/default-image.jpg";
                    const status = getAuctionStatus(item.auctionTime);
                    const isComingSoon = status === "Coming Soon";
                    const isEnded = status === "End of Auction";
                    const isOngoing = !isComingSoon && !isEnded;

                    return (
                        <Link
                            href={`/auctionpage/${item.id}`}
                            key={index}
                            className="bg-white shadow-lg rounded-lg overflow-hidden hover:scale-105 duration-300 cursor-pointer"
                        >
                            <Image
                                src={imageUrl}
                                alt={item.name}
                                width={400}
                                height={100}
                                className="w-full h-35 object-cover"
                            />
                            <div className="px-4 py-2">
                                <h3 className="font-bold text-sm h-[20px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer">
                                    {item.name}
                                </h3>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                                        Category: {item.category}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span
                                        className={`flex gap-1 font-thin ${isComingSoon ? "text-blue-500" : isEnded ? "text-red-500" : "text-orange-300"}`}
                                    >
                                        <Clock className="w-3 h-3 mt-1" /> {status}
                                    </span>
                                    <span className="text-gray-500 font-extralight overflow-hidden whitespace-nowrap text-ellipsis">
                                        Current Bid
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-xs w-full">
                                    <div>{bidderCounts[item.id] || 0} bidder{bidderCounts[item.id] !== 1 ? 's' : ''}</div>
                                    <span className="text-blue-600 font-normal overflow-hidden whitespace-nowrap text-ellipsis text-xs">
                                        {Number(item.highest_bid).toLocaleString()} VND
                                    </span>
                                </div>

                                <button
                                    className={`w-full mt-2 py-1 rounded-lg text-white font-semibold text-base h-[35px] transition duration-400 ${isComingSoon || isEnded
                                        ? "bg-gray-400 cursor-not-allowed "
                                        : "bg-blue-600 hover:bg-white hover:text-blue-600 cursor-pointer"
                                        }`}
                                    disabled={isComingSoon || isEnded}
                                >
                                    {isComingSoon ? "Coming Soon" : isEnded ? "End of Auction" : "Bid Now"}
                                </button>
                            </div>
                        </Link>
                    );
                }))}
            </div>
        </div>
    );
}