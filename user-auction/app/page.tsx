"use client";
import { useEffect } from "react";
import AppNavbar from "@/component/navbar/AppNavbar";
import AppHeader from "@/component/header/AppHeader";
import AppFooter from "@/component/footer/AppFooter";
import Category from "@/component/category/Category";
import Items from "@/component/wonbids/Items";
import Wallet from "@/component/wallet/Wallet";
import Auction from "@/component/auction/Auction";
import Head from "next/head";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  useEffect(() => {
    document.getElementById("section1")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div>

      <AppNavbar />
      <div className="snap-y snap-mandatory h-screen md:overflow-scroll md:scroll-smooth">
        <section
          id="section1"
          className="section snap-start min-h-screen bg-[#F8F1E5] flex justify-center items-center text-white text-3xl "
        >
          <AppHeader />
        </section>
        <section
          id="section2"
          className="section snap-start min-h-screen flex text-black text-3xl md:bg-[#F3F4F6] w-full bg-[#F8F1E5]"
        >
          <Category />
        </section>
        <section
          id="section3"
          className="section snap-start min-h-screen md:bg-white text-3xl bg-[#F8F1E5]"
        >
          <Auction />
        </section>
        <section
          id="section4"
          className="section snap-start min-h-screen text-black text-2xl md:bg-[#F3F4F6] w-full bg-[#F8F1E5]"
        >
          <Items />
        </section>
        <section
          id="section5"
          className="section snap-start min-h-screen md:bg-white bg-[#F8F1E5]"
        >
          <Wallet />
        </section>
        <section
          id="section6"
          className="section snap-start min-h-screen bg-[#161E2D] text-white text-xl "
        >
          <AppFooter />
        </section>
      </div>
    </div>
  );
}