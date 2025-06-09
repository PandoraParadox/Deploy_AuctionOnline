import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AppNavbar from "@/component/navbar/AppNavbar";
import AppFooter from "@/component/footer/AppFooter";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Auction Online",
    description: "UI for Auction Online",
};

export default function AuctionLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className={`${geistSans.variable} ${geistMono.variable} `}>
            <AppNavbar />
            <div className=" mx-auto p-6">{children}</div>
            <div className="snap-start min-h-screen bg-[#161E2D] text-white text-xl ">
                <AppFooter />
            </div>
        </main>
    );
}
