import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppNavbar from "@/component/navbar/AppNavbar";

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

export default function HelpCenterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className={`${geistSans.variable} ${geistMono.variable}`}>
            <AppNavbar />
            <div className="mx-auto">{children}</div>
        </main>
    );
}
