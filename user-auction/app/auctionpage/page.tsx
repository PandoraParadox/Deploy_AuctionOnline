"use client";
import Image from "next/image";
import { ReactHTMLElement, useEffect, useState } from "react";
import { FilterIcon, ClockBidIcon } from "@/icon";
import Link from "next/link";
import { Clock } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    startingPrice: string;
    category: string;
    images: string;
    auctionTime?: string;
    highest_bid: string;
}
function FilterPanel({
    onClose,
    onFilterChange,
    onClearFilters,
}: {
    onClose: () => void;
    onFilterChange: (filters: { category?: string; sort?: string }) => void;
    onClearFilters: () => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
        onFilterChange({ category: e.target.value });
    };

    return (
        <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-4xl mx-auto mb-6 animate-drop-down">
            <style jsx>{`
            @keyframes dropDown {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-drop-down {
              animation: dropDown 0.3s ease-out;
            }
          `}</style>

            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Filter Options</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="cursor-pointer w-full px-2 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                        >
                            <option value="">All Categories</option>
                            <option>Electronics & Gadgets</option>
                            <option>Luxury Watches & Jewelry</option>
                            <option>Art & Collectibles</option>
                            <option>Fashion & Accessories</option>
                            <option>Cars & Vehicles</option>
                            <option>Real Estate</option>
                            <option>Sports Memorabilia</option>
                            <option>Music & Entertainment</option>
                            <option>Home & Furniture</option>
                            <option>Toys & Collectibles</option>
                        </select>
                        <div className="cursor-pointer pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => onFilterChange({ sort: "priceHighToLow" })}
                            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex-1 text-center font-medium shadow-sm hover:shadow-md"
                        >
                            High to Low
                        </button>
                        <button
                            onClick={() => onFilterChange({ sort: "priceLowToHigh" })}
                            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex-1 text-center font-medium shadow-sm hover:shadow-md"
                        >
                            Low to High
                        </button>
                    </div>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={onClearFilters}
                        className="cursor-pointer px-4 py-2 w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AuctionPage() {
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;
    const [bidderCounts, setBidderCounts] = useState<Record<number, number>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [originalProducts, setOriginalProducts] = useState<Product[]>([]);


    const getAuctionStatus = (auctionTime?: string): string => {
        const now = new Date();
        const startTime = auctionTime ? new Date(auctionTime) : new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        const diffStartMs = startTime.getTime() - now.getTime();
        const diffEndMs = endTime.getTime() - now.getTime();

        if (diffStartMs > 0) return "Coming Soon";
        if (diffEndMs > 0) {
            const minutes = Math.floor(diffEndMs / (1000 * 60));
            const seconds = Math.floor((diffEndMs % (1000 * 60)) / 1000);
            return `${minutes}m ${seconds}s`;
        }
        return "End of Auction";
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/v1/products", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const { data }: { data: Product[] } = await response.json();
            const parsedData = data.map((product: Product) => ({
                ...product,
                images: typeof product.images === "string" ? JSON.parse(product.images) : product.images || [],
            }));

            setProducts(parsedData);
            setOriginalProducts(parsedData);
            return;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.error("Fetch failed:", errorMessage);
        }
    };
    const fetchBidderCount = async (productId: number): Promise<number> => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/bidder/${productId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const count = await response.json();
            return Number(count) || 0;
        } catch (error) {
            console.log(`Error fetching bidder count for product ${productId}:`, error);
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

    useEffect(() => {
        fetchProducts();
        const interval = setInterval(() => {
            setProducts((prevProducts) => [...prevProducts]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    const handleFilterChange = ({ category, sort }: { category?: string; sort?: string }) => {
        let filteredProducts = [...originalProducts];
        if (category && category !== "All Categories") {
            filteredProducts = filteredProducts.filter((product) => product.category === category);
        }
        if (sort === "priceHighToLow") {
            filteredProducts.sort((a, b) => Number(b.startingPrice) - Number(a.startingPrice));
        } else if (sort === "priceLowToHigh") {
            filteredProducts.sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice));
        }

        setProducts(filteredProducts);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setProducts(originalProducts);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const searchProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const context = e.target.value;

        if (context.trim() === "") {
            setProducts(originalProducts);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/search?query=${encodeURIComponent(context)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });
            const searched = await response.json();
            const validProducts = Array.isArray(searched.data) ? searched.data : [];
            const parsed = validProducts.map((product: Product) => ({
                ...product,
                images: typeof product.images === "string" ? JSON.parse(product.images) : product.images || [],
            }));

            setProducts(parsed);
        }
        catch (err) {
            console.log("Search error: ", err);
        }
    }

    return (
        <div className="pt-[95px] mx-auto scroll-smooth animate-drop-down max-w-6xl">
            <style jsx>{`
        @keyframes dropDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-drop-down {
          animation: dropDown 0.5s ease-in-out;
        }
      `}</style>
            <div className="flex justify-between items-center mb-6 w-full m-auto">
                <input
                    type="text"
                    placeholder="Search auctions..."
                    className="w-[60%] p-2 rounded-md bg-white hover:scale-105 duration-300 shadow-lg"
                    onChange={searchProduct}
                />
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-600 transition duration-400 hover:scale-105 cursor-pointer flex shadow-lg"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FilterIcon className="p-1 mr-2" /> Filters
                </button>
            </div>
            {showFilters && (
                <FilterPanel
                    onClose={() => setShowFilters(false)}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-2 w-full m-auto mt-2 cursor-pointer">
                {currentProducts.length === 0 ? (<div className="text-center w-full col-span-4 mx-auto text-2xl">No items found.</div>) : (
                    currentProducts.map((item: Product, index: number) => {
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
                                    <div className="flex justify-between  text-gray-500 text-sm">
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
                    })
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`cursor-pointer px-4 py-2 rounded-md ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                        Previous
                    </button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`cursor-pointer px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}