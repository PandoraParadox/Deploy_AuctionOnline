"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LeftArrowIcon, ClockBidIcon } from "@/icon";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/component/auth/authContext";
import Swal from 'sweetalert2';

interface Product {
    name: string;
    startingPrice: number;
    category: string;
    images: string[];
    auctionTime: string;
    end_time: string;
    description: string;
    highest_bid?: number;
    highest_bidder_user?: string;
}

interface Bid {
    id: number;
    product_id: number;
    user_id: string;
    bid_amount: number;
    bid_time: string;
}
interface BidWithName extends Bid {
    displayName: string;
}


export default function DetailAuction() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [remainingTime, setRemainingTime] = useState("");
    const [product, setProduct] = useState<Product | null>(null);
    const [status, setStatus] = useState<'Pending' | 'Active' | 'Ended' | 'Waiting' | null>(null);
    const [selectImg, setSelectImg] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string[]>([]);
    const [highestBid, setHighestBid] = useState<number>(0);
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [bidAmount, setBidAmount] = useState<number | null>();
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [bidHistoryWithNames, setBidHistoryWithNames] = useState<BidWithName[]>([]);



    const getIdToken = async (): Promise<string | null> => {
        try {
            if (user) {
                const token = await user.getIdToken(true);
                console.log("ID Token:", token);
                return token;
            }
            console.warn("No user to get token");
            return null;
        } catch (error) {
            console.log("Error getting ID token:", error);
            return null;
        }
    };

    const getUser = async (uid: string) => {
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/api/v1/user/${uid}`, {
                method: "GET",
                headers:
                {
                    "Content-Type": "application/json"
                }
            });
            const format = await data.json();
            return format.displayName;
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        const fetchDisplayNames = async () => {
            const enriched = await Promise.all(
                bidHistory.map(async (bid) => ({
                    ...bid,
                    displayName: await getUser(bid.user_id),
                }))
            );
            setBidHistoryWithNames(enriched);
        };

        if (bidHistory.length > 0) {
            fetchDisplayNames();
        }
    }, [bidHistory]);



    useEffect(() => {
        if (!user) {
            Swal.fire({
                title: 'Login required',
                text: 'Please login to view the auction.',
                icon: 'error',
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
                showCancelButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/login');
                }
            });
            setLoading(false);
            return;
        }

        if (!id) {

            Swal.fire({
                title: 'Error',
                text: 'Invalid product ID.',
                icon: 'error'
            });
            setLoading(false);
            router.push('/auctionpage');
            return;
        }

        const connectWebSocket = () => {
            const websocket = new WebSocket('wss://auction-backend-c7q3.onrender.com');
            setWs(websocket);

            websocket.onopen = async () => {
                console.log("WebSocket connected");
                const token = await getIdToken();
                if (!token) {

                    Swal.fire({
                        title: 'Error',
                        text: 'Invalid session.',
                        icon: 'error'
                    });
                    websocket.close();
                    return;
                }
                websocket.send(
                    JSON.stringify({
                        type: 'join',
                        auctionId: id,
                        userId: user.uid,
                        token,
                    })
                );
            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket message received:", data);

                if (data.type === 'error') {
                    setLoading(false);
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error'
                    });
                } else if (data.type === 'auction_data') {
                    const imagesArray = JSON.parse(data.auction.images || "[]");
                    setProduct({
                        name: data.auction.name,
                        startingPrice: data.auction.startingPrice.toString(),
                        category: data.auction.category || "",
                        images: imagesArray,
                        auctionTime: data.auction.auctionTime,
                        end_time: data.auction.end_time,
                        description: data.auction.description || "",
                        highest_bid: data.auction.highest_bid?.toString(),
                        highest_bidder_user: data.auction.highest_bidder_user,
                    });
                    setStatus(data.auction.status);
                    setHighestBid(data.auction.highest_bid || data.auction.startingPrice);
                    setBidHistory(data.bidHistory);
                    setImageUrl(imagesArray.map((img: string) => `${process.env.NEXT_PUBLIC_APP_API_URL}/uploads/${img}`));
                    setLoading(false);
                    console.log("Auction data received:", {
                        auctionTime: data.auction.auctionTime,
                        end_time: data.auction.end_time,
                        status: data.auction.status,
                    });
                } else if (data.type === 'update') {
                    setHighestBid(data.highestBid);
                    setBidHistory(data.bidHistory);
                } else if (data.type === 'auction_ended') {
                    setStatus('Ended');
                    setRemainingTime('End of Auction');
                    if (data.winnerId === user.uid) {
                        Swal.fire({
                            title: 'Congratulations!',
                            html: `You won the auction for ${data.name} with <b>${Math.trunc(data.finalPrice).toLocaleString('de-DE')} VND</b>!`,
                            icon: 'success',
                            confirmButtonText: 'View won items',
                            showDenyButton: true,
                            denyButtonText: 'Close'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                router.push('/wonitem');
                            }
                        });
                    } else if (data.winnerId) {
                        const showWinner = async () => {
                            const winnerName = await getUser(data.winnerId);
                            Swal.fire({
                                title: 'Auction ended',
                                text: `Auction ended. Winner: ${winnerName}`,
                                icon: 'info'
                            });
                        };

                        showWinner();
                    } else {
                        Swal.fire({
                            title: 'Auction ended',
                            text: 'Auction ended. No winner.',
                            icon: 'info'
                        });
                    }
                }
            };

            websocket.onclose = () => {
                console.log('WebSocket disconnected');
                setTimeout(connectWebSocket, 5000);
            };

            websocket.onerror = (err) => {
                console.log("WebSocket error:", err);
                setLoading(false);
            };

            return websocket;
        };

        const wsInstance = connectWebSocket();
        return () => {
            wsInstance.close();
        };
    }, [id, user, router]);

    useEffect(() => {
        if (!product || !status || !ws || ws.readyState !== WebSocket.OPEN) return;

        const endTime = new Date(product.end_time);
        if (isNaN(endTime.getTime())) {
            Swal.fire({
                title: 'Error',
                text: 'Invalid auction end time.',
                icon: 'error'
            });
            setLoading(false);
            return;
        }

        let waitingTimeout: NodeJS.Timeout | null = null;
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = endTime.getTime() - now;

            if (diff <= 0 && status !== 'Ended' && status !== 'Waiting') {
                setStatus('Waiting');
                setRemainingTime('End of Auction');

                ws.send(
                    JSON.stringify({
                        type: "check_auction",
                        auctionId: id,
                    })
                );
                console.log("Sent check_auction for auction", id);

                waitingTimeout = setTimeout(() => {
                    if (status === 'Active' || status === 'Pending') {
                        setStatus('Ended');
                        Swal.fire({
                            title: 'Auction ended',
                            text: 'Auction ended. Waiting for server confirmation.',
                            icon: 'info'
                        });
                    }
                }, 1500);
                return;
            } else if (status === 'Ended' || status === 'Waiting') {
                setRemainingTime('End of Auction');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            if (hours > 0) {
                setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setRemainingTime(`${minutes}m ${seconds}s`);
            } else {
                setRemainingTime(`${seconds}s`);
            }

            if (diff <= 60000 && diff > 0) {
                ws.send(
                    JSON.stringify({
                        type: "check_auction",
                        auctionId: id,
                    })
                );
                console.log("Sent check_auction for auction", id);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => {
            clearInterval(timer);
            if (waitingTimeout) clearTimeout(waitingTimeout);
        };
    }, [product, status, ws, id]);

    useEffect(() => {
        if (!selectImg && imageUrl.length > 0) {
            setSelectImg(imageUrl[0]);
        }
    }, [imageUrl, selectImg]);

    const nextBid = useMemo(() => {
        return Math.trunc(highestBid) + 5000000;
    }, [highestBid]);

    const setValue = () => {
        setBidAmount(nextBid);
    };

    const handleBid = async () => {
        if (!user) {
            await Swal.fire({
                title: 'Login required',
                text: 'Please login to place a bid!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Go to login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/authen');
                }
            });
            return;
        }
        if (!bidAmount || bidAmount <= highestBid) {
            Swal.fire({
                title: 'Error',
                text: 'Bid amount must be higher than current price!',
                icon: 'error'
            });
            return;
        }
        if (status !== 'Active') {
            Swal.fire({
                title: 'Error',
                text: 'Auction is not active!',
                icon: 'error'
            });
            return;
        }
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            Swal.fire({
                title: 'Connection error',
                text: 'Cannot connect to auction server.',
                icon: 'error'
            });
            return;
        }
        try {
            const token = await user.getIdToken();
            if (!token) {
                Swal.fire({
                    title: 'Error',
                    text: 'Invalid session.',
                    icon: 'error'
                });
                return;
            }
            ws.send(
                JSON.stringify({
                    type: 'bid',
                    auctionId: id,
                    userId: user.uid,
                    bidAmount: bidAmount,
                    token,
                })
            );
            const data = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/api/v1/wallet/transaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: user.uid,
                    type: 'Bids',
                    amount: bidAmount,
                    description: `Bidding item : ${product?.name}`,
                })
            });

            if (!data.ok) {
                const error = await data.json().catch(() => ({}));
                throw new Error(error || data.status);
            }

        } catch (err) {
            console.log(err);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to place bid!'
            });
        }

        setBidAmount(null);
    };

    const isComingSoon = status === "Pending";
    const isEnded = status === "Ended" || status === "Waiting";

    if (loading) {
        return <div className="text-center p-6">Loading...</div>;
    }

    if (!product) {
        return <div className="text-center p-6">Product not found.</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/auctionpage"
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        <LeftArrowIcon className="mr-2" />
                        <span className="text-sm font-medium">Back to auctions</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {selectImg && (
                                <Image
                                    src={selectImg}
                                    alt="Product Main"
                                    className="w-full h-96 object-contain"
                                    width={800}
                                    height={500}
                                    priority
                                />
                            )}
                        </div>

                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {imageUrl.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectImg(img)}
                                    className={`cursor-pointer flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${selectImg === img ? 'border-blue-500' : 'border-transparent'}`}
                                >
                                    <Image
                                        src={img}
                                        width={80}
                                        height={80}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                            <div className="prose prose-sm text-gray-600">
                                {product.description || "No description available."}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                            <div className={`flex items-center mb-6 ${isComingSoon ? "text-blue-500" : isEnded ? "text-red-500" : "text-amber-500"}`}>
                                <ClockBidIcon className="mr-2" />
                                <span className="text-sm font-medium">{remainingTime || "Loading..."}</span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        {isComingSoon ? "Starting price" : isEnded ? "Final price" : "Current bid"}
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {Math.trunc(highestBid).toLocaleString('de-DE')} VND
                                    </span>
                                </div>

                                {!isComingSoon && !isEnded && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Min. bid</span>

                                        <span className="text-sm font-medium text-gray-900">
                                            {nextBid.toLocaleString()} VND
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="number"
                                    placeholder="Enter your bid amount"
                                    value={bidAmount ?? ""}
                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isComingSoon || isEnded}
                                />

                                <button
                                    onClick={handleBid}
                                    disabled={isComingSoon || isEnded}
                                    className={`cursor-pointer w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${isComingSoon || isEnded
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                        }`}
                                >
                                    {isComingSoon ? "Coming soon" : isEnded ? "Auction ended" : "Place bid"}
                                </button>

                                {!isComingSoon && !isEnded && (
                                    <button
                                        onClick={setValue}
                                        className="w-full text-sm text-blue-600 hover:text-blue-800 text-center cursor-pointer"
                                    >
                                        Set minimum bid amount
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping & Returns</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Shipping:</span> Free worldwide shipping. Orders are processed within 1–2 business days.
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Returns:</span> 14-day return policy from the date of delivery.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Security</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Payments:</span> All transactions are securely encrypted.
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Protection:</span> Buyer protection on all successful bids.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Bid History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bidder
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bidHistoryWithNames.map((bid) => (
                                    <tr key={bid.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {bid.displayName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {bid.bid_amount.toLocaleString()} VND
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(bid.bid_time).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
