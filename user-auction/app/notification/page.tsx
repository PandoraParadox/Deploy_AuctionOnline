"use client"
import React, { useEffect, useState } from 'react';
import { BellIcon, GavelIcon, TimerIcon, AlertCircleIcon, CheckCircleIcon, ReceiptText, BadgeDollarSign } from 'lucide-react';
interface Notification {
    id: string;
    type: 'bid' | 'auction' | 'confirm' | 'cancel';
    message: string;
    time: string;
    sttus: boolean;
}
import { useAuth } from "@/component/auth/authContext";

export default function NotificationSection() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    useEffect(() => {
        const fetchNotification = async () => {
            const token = await user?.getIdToken(true);
            const data = await fetch(`http://localhost:5000/api/v1/notification/${user?.uid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })

            if (!data.ok) {
                const errData = await data.json().catch(() => ({}));
                throw new Error(errData || "Fetching failed");
            }

            const dataFormat = await data.json();
            console.log("data: ", dataFormat);
            setNotifications(dataFormat);
        }
        if (user) {
            fetchNotification();
        }
    }, [user]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'bid':
                return <GavelIcon className="h-5 w-5 text-blue-500" />;
            case 'auction':
                return <ReceiptText className="h-5 w-5 text-green-500" />;
            case 'confirm':
                return <BadgeDollarSign className="h-5 w-5 text-yellow-500" />;
            case 'cancel':
                return <BadgeDollarSign className="h-5 w-5 text-red-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };
    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    const markAsRead = async (id: string) => {
        setNotifications(notifications.map(notif => notif.id === id ? {
            ...notif,
            sttus: true
        } : notif));
        try {
            const token = await user?.getIdToken(true);
            const response = await fetch(`http://localhost:5000/api/v1/notification/markOneRead/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Marking failed");
            }
        } catch (err) {
            console.log("Error marking notification as read:", err);
        }
    };
    const clearAll = () => {
        const deleteNotification = async () => {
            try {
                const token = await user?.getIdToken(true);
                const data = await fetch(`http://localhost:5000/api/v1/notification/clearAll/${user?.uid}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!data.ok) {
                    const errData = await data.json().catch(() => ({}));
                    throw new Error(errData || "Fetching failed");
                }
                setNotifications([]);
            } catch (error) {
                console.log("Error clearing notifications:", error);
            }
        }
        if (setNotifications.length > 0) {
            deleteNotification();
        }
    };
    const markAllAsRead = async () => {
        setNotifications(notifications.map(notif => ({
            ...notif,
            sttus: true
        })));
        try {
            const token = await user?.getIdToken(true);
            const response = await fetch(`http://localhost:5000/api/v1/notification/readAll/${user?.uid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Marking failed");
            }
        } catch (err) {
            console.log("Error marking all as read:", err);
        }
    };
    const unreadCount = notifications.filter(n => !n.sttus).length;
    return <div className="w-[70%] mx-auto mt-[100px]">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Auction Notifications</h2>
                {unreadCount > 0 && <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {unreadCount} new
                </span>}
            </div>
            <div className="flex gap-2">
                <button onClick={markAllAsRead} className="text-sm border rounded-lg p-2 cursor-pointer hover:text-white hover:bg-black text-gray-600 hover:text-gray-900 duration-200 ">
                    Mark all as read
                </button>
                <button onClick={clearAll} className="text-sm border rounded-lg p-2 cursor-pointer hover:text-white hover:bg-black text-gray-600 hover:text-gray-900 duration-200">
                    Clear all
                </button>
            </div>
        </div>
        <div className="space-y-4 h-[550px] overflow-y-auto ">
            {notifications.length > 0 ? notifications.map(notification => <div key={notification.id} className={` flex items-start gap-4 p-4 rounded-lg ${notification.sttus ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                <div className="flex-grow min-w-0">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.time)}
                    </p>
                </div>
                {!notification.sttus && <button onClick={() => markAsRead(notification.id)} className="flex-shrink-0 text-gray-400 hover:text-blue-600 cursor-pointer" title="Mark as read">
                    <CheckCircleIcon className="h-5 w-5" />
                </button>}
            </div>) : <div className="text-center py-12">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications
                </h3>
                <p className="text-gray-500">You're all caught up!</p>
            </div>}
        </div>
    </div>;
};