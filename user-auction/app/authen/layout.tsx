import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

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

export default function AuthenLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className={`${geistSans.variable} ${geistMono.variable} `}>
            <div className=" mx-auto ">{children}</div>
        </main>
    );
}
