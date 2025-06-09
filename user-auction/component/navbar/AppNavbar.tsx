'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { LogoIcon } from '@/icon';
import Image from 'next/image';
import avatar from '../../icon/3607444.png';
import { UserIcon, HelpIcon, SettingIcon, LogOutIcon, BellIcon } from '@/icon/index';
import Link from 'next/link';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from "@/component/auth/authContext";

interface Notification {
    id: string;
    sttus: boolean;
}

function UserManagerBoard({ unreadCount }: { unreadCount: number }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('sessionId');
            localStorage.removeItem('authTokenAdmin');
            localStorage.removeItem('emailAdmin');
            document.cookie = 'idToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            router.push('/authen');
        } catch (error: any) {
            console.log('Logout failed:', error.message);
        }
    };

    return (
        <div className="fixed top-16 right-4 w-64 h-63 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 animate-fade-in overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {user?.displayName || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'email@example.com'}
                </div>
            </div>
            <div className="p-2 space-y-1">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                </Link>

                <Link
                    href="/notification"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors relative"
                >
                    <BellIcon className="w-4 h-4" />
                    <span>Notification</span>
                    {unreadCount > 0 && (
                        <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <Link
                    href="/helpcenter"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                    <HelpIcon className="w-4 h-4" />
                    <span>Help Center</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Sign out</span>
                </button>
            </div>


        </div>
    );
}

export default function AppNavbar() {
    const router = useRouter();
    const [userManager, setUserManager] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user: authUser } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', id: 'section1' },
        { name: 'Category', id: 'section2' },
        { name: 'Auction', id: 'section3' },
        { name: 'My Items', id: 'section4' },
        { name: 'My Wallet', id: 'section5' },
        { name: 'Contact', id: 'section6' },
    ];

    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            if (!authUser) return;

            try {
                const token = await authUser.getIdToken(true);
                const response = await fetch(`http://localhost:5000/api/v1/notification/${authUser.uid}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const notifications: Notification[] = await response.json();
                    const count = notifications.filter(n => !n.sttus).length;
                    setUnreadCount(count);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                router.push('/authen');
            } else {
                fetchUnreadNotifications();
            }
        });

        const interval = setInterval(fetchUnreadNotifications, 60000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [authUser, router]);

    const handleNavigation = (id: string) => {
        setMobileMenuOpen(false);
        if (window.location.pathname !== '/') {
            router.push('/');
            setActiveSection(id);
            setTimeout(() => {
                const section = document.getElementById(id);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        } else {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(id);
            }
        }
    };

    return (
        <>
            <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm text-white shadow-md z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center hover:opacity-80 transition-opacity"
                            onClick={() => setActiveSection('section1')}
                        >
                            <LogoIcon className="h-8 w-auto" />
                        </Link>

                        <div className="hidden md:flex space-x-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigation(item.id)}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative
                                        ${activeSection === item.id
                                            ? 'text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-white'
                                            : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div
                                    className="relative user-avatar"
                                    onClick={() => setUserManager(!userManager)}
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer">
                                        <Image
                                            src={user.photoURL || avatar}
                                            width={40}
                                            height={40}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/authen"
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                                >
                                    Log in
                                </Link>
                            )}

                            <button
                                className="md:hidden p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-gray-900 px-4 py-2 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.id)}
                                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left
                                    ${activeSection === item.id
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {userManager && <UserManagerBoard unreadCount={unreadCount} />}
        </>
    );
}
