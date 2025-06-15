"use client";
import {
    TechIcon,
    WatchIcon,
    ArtIcon,
    FashionIcon,
    CarIcon,
    HouseIcon,
    FootballIcon,
    MusicIcon,
    FurnitureIcon,
    GameIcon,
} from "@/icon";
import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import { Watch, Brush, Shirt, Car, House, Trophy, Music, Armchair, Gamepad2, SmartphoneCharging } from 'lucide-react';


interface CategoryData {
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    name: string;
    items: number;
    hoverColor: string;
}


interface Product {
    id: number;
    name: string;
    startingPrice: string;
    category: string;
    images: string;
    auctionTime?: string;
}


const initialCategories: CategoryData[] = [
    { Icon: SmartphoneCharging, name: "Electronics & Gadgets", items: 0, hoverColor: "purple-500" },
    { Icon: Watch, name: "Luxury Watches & Jewelry", items: 0, hoverColor: "red-500" },
    { Icon: Brush, name: "Art & Collectibles", items: 0, hoverColor: "pink-500" },
    { Icon: Shirt, name: "Fashion & Accessories", items: 0, hoverColor: "green-500" },
    { Icon: Car, name: "Cars & Vehicles", items: 0, hoverColor: "gray-500" },
    { Icon: House, name: "Real Estate", items: 0, hoverColor: "yellow-500" },
    { Icon: Trophy, name: "Sports Memorabilia", items: 0, hoverColor: "teal-500" },
    { Icon: Music, name: "Music & Entertainment", items: 0, hoverColor: "orange-500" },
    { Icon: Armchair, name: "Home & Furniture", items: 0, hoverColor: "cyan-500" },
    { Icon: Gamepad2, name: "Toys & Collectibles", items: 0, hoverColor: "indigo-500" },
];

const hoverClassMap: Record<string, string> = {
    "purple-500": "hover:to-purple-500",
    "red-500": "hover:to-red-500",
    "pink-500": "hover:to-pink-500",
    "green-500": "hover:to-green-500",
    "gray-500": "hover:to-gray-500",
    "yellow-500": "hover:to-yellow-500",
    "teal-500": "hover:to-teal-500",
    "orange-500": "hover:to-orange-500",
    "cyan-500": "hover:to-cyan-500",
    "indigo-500": "hover:to-fuchsia-500",
};
const textHoverClassMap: Record<string, string> = {
    "purple-500": "group-hover:text-purple-500",
    "red-500": "group-hover:text-red-500",
    "pink-500": "group-hover:text-pink-500",
    "green-500": "group-hover:text-green-500",
    "gray-500": "group-hover:text-gray-500",
    "yellow-500": "group-hover:text-yellow-500",
    "teal-500": "group-hover:text-teal-500",
    "orange-500": "group-hover:text-orange-500",
    "cyan-500": "group-hover:text-cyan-500",
    "indigo-500": "group-hover:text-fuchsia-500",
};



function CategoryCard({ Icon, name, items, hoverColor }: CategoryData) {
    const hoverClass = hoverClassMap[hoverColor] || "";
    const hoverIcon = textHoverClassMap[hoverColor] || "";
    return (
        <div
            className={clsx(
                "h-[150px] rounded-xl p-3 bg-white shadow-md transform hover:-translate-y-2 duration-300 cursor-pointer group bg-gradient-to-br from-white hover:from-sky-500",
                hoverClass
            )}
        >
            <div className={clsx(
                "m-2 p-1 rounded-xl w-[30%] flex justify-center",
                "bg-[#F3F4F6] group-hover:bg-opacity-20",
                hoverIcon
            )}>
                <Icon />
            </div>
            <div className="ml-2 mt-4 text-sm font-medium group-hover:text-white">{name}</div>
            <div className="ml-2 font-thin text-xs text-[#606975] group-hover:text-white">
                {items} items
            </div>
        </div>
    );
}

export default function Category() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>(initialCategories);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/api/v1/products`, {
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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.log("Fetch failed:", errorMessage);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            const categoryCounts: Record<string, number> = {};
            products.forEach((product) => {
                const categoryName = product.category;
                categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            });

            const updatedCategories = initialCategories.map((category) => ({
                ...category,
                items: categoryCounts[category.name] || 0,
            }));

            setCategories(updatedCategories);
        }
    }, [products]);

    return (
        <div className="mt-20 w-[95%] md:mt-30 md:w-[70%] mx-auto">
            <div className="flex justify-center text-3xl font-extrabold">Browse by Category</div>
            <div className="flex justify-center text-base text-[#606975] mt-5 text-center">
                Explore our wide range of categories and find exactly what you're looking for
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-10">
                {categories.map((category, index) => (
                    <CategoryCard
                        key={index}
                        Icon={category.Icon}
                        name={category.name}
                        items={category.items}
                        hoverColor={category.hoverColor}
                    />
                ))}
            </div>
        </div>
    );
}