"use client";
import { useState, useEffect } from "react";
import AppNavbar from "@/component/navbar/AppNavbar";
import Rare from "../../icon/radiohead-in-rainbows-1_e0ff70e1-10bc-4ac1-bcf1-2b1046771130.webp";
import Rolex from "../../icon/191.webp";
import Camera from "../../icon/kpeso8y4r3n21.jpg";
import Image from "next/image";
import { IncreaseIcon, ShieldIcon, AuctionIcon, BadgeIcon } from "@/icon";
import { Gavel, UsersRound, Medal, ShieldCheck } from 'lucide-react';


export default function AppHeader() {
    const images = [Rare.src, Rolex.src, Camera.src];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPaused, images.length]);

    return (
        <div className="w-[90%] mx-auto mt-15 flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full lg:w-[50%] flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold w-full lg:w-[90%] mb-6 text-[#2C3E50] leading-tight">
                    Discover Unique Items and <br></br> <span className="text-[#E74C3C]">Place Your Bids</span>
                </h1>
                <p className="text-lg md:text-xl w-full lg:w-[90%] mb-8 text-[#34495E] leading-relaxed">
                    Join thousands of collectors and enthusiasts in our live online auctions. Find rare
                    collectibles, art, and more in our curated marketplace.
                </p>
                <div className=" hidden md:grid md:grid-cols-4 gap-4 w-full lg:w-[90%]">
                    {[
                        { icon: <Gavel className="text-[#E74C3C]" />, value: "2,500+", label: "Active Auctions" },
                        { icon: <UsersRound className="text-[#E74C3C]" />, value: "10,000+", label: "Professional Collectors" },
                        { icon: <Medal className="text-[#E74C3C]" />, value: "99.9%", label: "Success Rate" },
                        { icon: <ShieldCheck className="text-[#E74C3C]" />, value: "100%", label: "Secure Transactions" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-[#ECF0F1]"
                        >
                            <div className="m-2 flex justify-center ">{item.icon}</div>
                            <div className="text-xl font-bold text-center text-[#2C3E50]">{item.value}</div>
                            <div className="text-sm text-center mt-2 text-[#7F8C8D]">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="w-full lg:w-[50%] flex justify-center items-center mt-6 lg:mt-0"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden rounded-2xl shadow-xl">
                    {images.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`slide-${index}`}
                            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                        />
                    ))}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full ${currentIndex === idx ? 'bg-[#E74C3C]' : 'bg-white/70'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}