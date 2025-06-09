"use client";
import React, { useEffect, useState, useRef } from "react";
import { SaveIcon, Camera } from "lucide-react";
import Image from "next/image";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import avatar from "../../icon/3607444.png";
import { ToastContainer, toast } from 'react-toastify';

export default function Profile() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<{
        uid: string | null;
        displayName: string | null;
        email: string | null;
        imgUrl: string | null;
    }>({
        uid: null,
        displayName: null,
        email: null,
        imgUrl: null,
    });


    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || "Not set",
                    email: firebaseUser.email || "Not set",
                    imgUrl: firebaseUser.photoURL || null,
                });
            } else {
                setUser({
                    uid: null,
                    displayName: null,
                    email: null,
                    imgUrl: null,
                });
            }

        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const storage = getStorage();
            const storageRef = ref(storage, `user-avatars/${currentUser.uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateProfile(currentUser, { photoURL: downloadURL });
            setUser((prev) => ({ ...prev, imgUrl: downloadURL }));
        } catch (error) {
            console.log("Error uploading image:", error);
        }
    };

    const handleSave = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            await updateProfile(currentUser, {
                displayName: user.displayName || "",
            });
            toast.success('Update successfully', {
                position: 'bottom-right',
                autoClose: 1000,
            });
        } catch (error) {
            console.log("Error updating profile:", error);
            toast.success('Update fail', {
                position: 'bottom-right',
                autoClose: 1000,
            });
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <ToastContainer />
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="flex w-full gap-3">
                    <div>
                        <div className="relative w-[100px] h-[100px] mx-auto  ">
                            <Image
                                src={user.imgUrl || avatar}
                                alt="User Avatar"
                                fill
                                className="rounded-full object-cover border-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full z-10 hover:scale-105 duration-300 cursor-pointer "
                                onClick={handleUpload}
                            >
                                <Camera className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <div className="text-xs mt-4 text-center">
                            Click the camera icon to change your profile picture
                        </div>
                    </div>
                    <form className="space-y-4 w-[80%]">
                        <div>
                            <label htmlFor="uid" className="block text-sm font-medium text-gray-700 mb-1">
                                User ID
                            </label>
                            <input
                                type="text"
                                id="uid"
                                name="uid"
                                value={user.uid || ""}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={user.displayName || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email || ""}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div className="pt-4 text-center">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto cursor-pointer hover:scale-105 duration-300"
                            >
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}