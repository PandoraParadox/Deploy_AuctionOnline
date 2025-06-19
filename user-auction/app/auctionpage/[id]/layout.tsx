import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
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

export default function DetailLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <main
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <div className=" mx-auto p-6 mt-12">{children}</div>

        </main>

    );
}
