"use client";
import {
    Shield2Icon,
    HeadsetIcon,
    TruckIcon,
    WalletIcon,
    FacebookIcon,
    TwitterIcon,
    LinkedInIcon,
    InstagramIcon,
    ClockIcon,
    InternetIcon,
    CallIcon,
    EmailIcon,
    GpsIcon,
} from "@/icon";
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';


export default function AppFooter() {
    return (
        <>
            <div>
                <div className="">
                    <div className="invisible md:visible flex w-full justify-center items-center gap-25 mb-10">
                        <div className="mt-35 hidden md:flex flex-col items-center">
                            <div className="bg-[#1E2541] rounded-full p-3"><Shield2Icon /></div>
                            <div className="text-sm font-semibold mt-4 ">Secure Payments</div>
                            <div className="text-xs font-thin mt-2 text-[#9399A6]">Protected by SSL encryption</div>
                        </div>
                        <div className="mt-35 hidden md:flex flex-col items-center">
                            <div className="bg-[#1E2541] rounded-full p-3"><WalletIcon /></div>
                            <div className="text-sm font-semibold mt-4">Multiple Payment Options</div>
                            <div className="text-xs font-thin mt-2 text-[#9399A6]">Credit card, PayPal, & more</div>
                        </div>
                        <div className="mt-35 hidden md:flex flex-col items-center">
                            <div className="bg-[#1E2541] rounded-full p-3"><TruckIcon /></div>
                            <div className="text-sm font-semibold mt-4">Worldwide Shipping</div>
                            <div className="text-xs font-thin mt-2 text-[#9399A6]">Delivery to your doorstep</div>
                        </div>
                        <div className="mt-35 hidden md:flex flex-col items-center">
                            <div className="bg-[#1E2541] rounded-full p-3"><HeadsetIcon /></div>
                            <div className="text-sm font-semibold mt-4">24/7 Support</div>
                            <div className="text-xs font-thin mt-2 text-[#9399A6]">Always here to help you</div>
                        </div>
                    </div>
                </div>
                <div className="mt-30 px-10 justify-center items-center w-full ">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white md:w-[80%] w-[95%] md:ml-50">
                        <div className="w-[90%]">
                            <h3 className="text-base font-semibold mb-2">BidWave</h3>
                            <p className="text-sm text-gray-400 mb-4 mt-5">
                                The premier online auction platform for unique and valuable items. Bid, win, and discover something special in our curated marketplace.
                            </p>
                            <div className="flex gap-7 w-full mt-5">
                                <Facebook className=" w-8 h-8 p-1 text-gray-400 hover:text-white cursor-pointer border rounded-full hover:scale-110 duration-400 hover:bg-[#1E2541]" />
                                <Twitter className=" w-8 h-8 p-1 text-gray-400 hover:text-white cursor-pointer border  rounded-full hover:scale-110 duration-400 hover:bg-[#1E2541]" />
                                <Instagram className=" w-8 h-8 p-1 text-gray-400 hover:text-white cursor-pointer border  rounded-full hover:scale-110 duration-400 hover:bg-[#1E2541]" />
                                <Linkedin className=" w-8 h-8 p-1 text-gray-400 hover:text-white cursor-pointer border  rounded-full hover:scale-110 duration-400 hover:bg-[#1E2541]" />
                            </div>
                        </div>
                        <div className="w-[80%] ml-7">
                            <h3 className="text-base font-semibold mb-3 ">Quick Links</h3>
                            <ul className="list-disc marker:text-purple-500 marker:text-2xl space-y-2 pl-5 text-sm cursor-pointer text-gray-400">
                                <li className="hover:text-white duration-400 ">Home</li>
                                <li className="hover:text-white duration-400">Browse Auctions</li>
                                <li className="hover:text-white duration-400">How It Works</li>
                                <li className="hover:text-white duration-400">Contact Us</li>
                            </ul>

                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-3">Help Center</h3>
                            <div className="space-y-2 text-gray-400">
                                <div className="flex items-center gap-2 text-sm mt-5"><ClockIcon className="text-purple-500" /> Customer Service Hours</div>
                                <div className="flex items-center gap-2 text-sm mt-5"><InternetIcon className="text-purple-500" /> International Support</div>
                                <div className="flex items-center gap-2 text-sm mt-5"><Shield2Icon className="text-purple-500" /> Buyer Protection</div>
                                <div className="flex items-center gap-2 text-sm mt-5"><WalletIcon className="text-purple-500" /> Payment Methods</div>
                            </div>
                        </div>
                        <div className=" w-[90%]">
                            <h3 className="text-base font-semibold mb-3">Get in Touch</h3>
                            <div className="space-y-2 text-gray-400">
                                <div className="flex items-center gap-2 text-sm mt-5"><CallIcon className="text-purple-500" /> +84 867 797 248</div>
                                <div className="flex items-center gap-2 text-sm mt-5"><EmailIcon className="text-purple-500" /> lehoahiepk9@gmail.com</div>
                                <div className="flex items-center gap-2 text-sm mt-5"><GpsIcon className="text-purple-500" />123 Nguyen Van Cu, District 5</div>
                            </div>

                            <h3 className="text-base font-semibold mt-6 mb-4">Newsletter</h3>
                            <p className="text-sm text-gray-400 mb-7">
                                Subscribe to receive updates on new auctions and special events.
                            </p>
                            <form className="flex bg-gray-800 rounded-lg overflow-hidden text-sm">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="px-4 py-2 w-full bg-gray-900 text-white outline-none"
                                />
                                <button type="submit" className="cursor-pointer px-6 py-2 bg-indigo-500 text-white font-base hover:bg-white hover:text-black duration-400">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}