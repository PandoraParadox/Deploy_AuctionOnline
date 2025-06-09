"use client";
import { useEffect, useState } from "react";
import Rare from '../../icon/radiohead-in-rainbows-1_e0ff70e1-10bc-4ac1-bcf1-2b1046771130.webp'
import Rolex from '../../icon/191.webp';
import Camera from '../../icon/kpeso8y4r3n21.jpg';
import Image from "next/image";
import {
    RightIcon
} from "@/icon";

interface wonItem {
    id: number;
    name: string;
    date: Date;
    price: number;
    status: "Pending" | "Delivered";
    image: string;
}


export default function WonItem() {
    const [Item, setItem] = useState<wonItem[]>([
        {
            id: 1,
            name: 'Rare Vinyl Records',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rare.src,
        },
        {
            id: 2,
            name: 'Rolex Daytona',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rolex.src,
        },
        {
            id: 3,
            name: 'Vintage Camera Collection',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Delivered",
            image: Camera.src,
        },
        {
            id: 4,
            name: 'Rare Vinyl Records',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rare.src,
        },
        {
            id: 5,
            name: 'Rolex Daytona',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rolex.src,
        },
        {
            id: 6,
            name: 'Vintage Camera Collection',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Delivered",
            image: Camera.src,
        },
        {
            id: 7,
            name: 'Rare Vinyl Records',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rare.src,
        },
        {
            id: 8,
            name: 'Rolex Daytona',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Pending",
            image: Rolex.src,
        },
        {
            id: 9,
            name: 'Vintage Camera Collection',
            date: new Date("2023-12-03"),
            price: 18500,
            status: "Delivered",
            image: Camera.src,
        }
    ]);

    return (
        <div className=" bg-[#F8F8F8] h-full">
            <div className="pt-35 w-[90%] m-auto flex ">
                <div className="w-full">
                    <div className="text-3xl font-extrabold">Auctioned Items</div>
                    <div className=" text-sm text-[#606975] mt-2">Manage your funds and track your transactions</div>
                </div>
                <div className="flex gap-5 items-center  h-full p-3">
                    <button
                        className="w-[150px] h-[40px] rounded-md bg-[#5C6BC0] font-sm cursor-pointer text-white hover:text-black hover:border border-[#5C6BC0]  hover:bg-white duration-200 hover:scale-105"
                    >
                        Payment Due
                    </button>
                    <button
                        className="w-[150px] h-[40px] rounded-md bg-[#5C6BC0] font-sm cursor-pointer text-white hover:text-black hover:border border-[#5C6BC0] hover:bg-white duration-200 hover:scale-105"
                    >
                        Paid
                    </button>
                </div>
            </div>


            <div className="overflow-x-auto flex gap-15 mt-10 h-[500px] mx-auto pt-[20px] px-[20px]">
                {Item.map((item, id) => (
                    <div key={item.id} className=" min-w-[316px] rounded-2xl bg-white h-[400px] shadow-2xl hover:scale-105 duration-300">
                        <div className="w-full h-[45%] relative mb-2">
                            <Image src={item.image} width={200} height={200} alt="Product 1" className="w-full h-full object-cover rounded-xl" />
                            <div className={`absolute top-3 right-3 text-xs text-[#606975] rounded-xl font-semibold text-[#92400E] p-1 px-3 ${item.status === "Pending" ? "bg-[#FEF3C7]" : "bg-[#D9F8E3]"}`}>{item.status}</div>
                        </div>
                        <div className="w-[90%] mx-auto">
                            <div className="text-xl font-bold mb-1 text-gray-500">{item.name}</div>
                            <div className="text-sm  font-semibold text-[#6865FF] mb-3">Won on {item.date.toLocaleDateString()}</div>
                            <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                <div>Final Price</div>
                                <div>${Math.trunc(item.price).toLocaleString('de-DE')}</div>
                            </div>
                            <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                <div>Payment Status</div>
                                <div>{item.status === 'Pending' ? "Payment Due" : "Paid"} </div>
                            </div>
                            <div className="flex text-sm text-[#606975] w-full mb-3 justify-between">
                                <div>{item.status === 'Pending' ? "Payment Due By" : "Delivered on"}</div>
                                <div>12/10/2023</div>
                            </div>
                        </div>
                        <button className={`p-2 w-[95%] rounded-lg text-sm block mx-auto cursor-pointer duration-400 ${item.status === 'Pending' ?
                            "bg-[#4F46E5] text-white hover:text-[#4F46E5] hover:bg-white hover:border"
                            : "bg-white text-gray-500 border  hover:text-white hover:bg-gray-500 "}`}>
                            {item.status === 'Pending' ? "Complete Payment" : "View Detail"}
                        </button>
                    </div>

                ))}
            </div>
        </div>

    )
}