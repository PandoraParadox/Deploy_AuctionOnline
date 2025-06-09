'use client';
import React, { useState, useEffect } from 'react';
import { LoginForm } from '../../component/login/AppLogin';
import { RegisterForm } from '../../component/register/AppRegister';
import { auth, database } from '../../firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const sessionId = uuidv4();

                localStorage.setItem('sessionId', sessionId);
                await set(ref(database, 'sessions/' + user.uid), {
                    sessionId,
                    lastLoginAt: Date.now(),
                    deviceInfo: navigator.userAgent,
                });

                await Swal.fire({
                    title: 'Signed in',
                    text: 'You have logged in successfully!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.push('/');
                });
            }
        });
        return () => unsubscribe();
    }, [router]);

    return (
        <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isLogin ? 'Login' : 'Register'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {isLogin ? 'Login to access your account' : 'Create a new account'}
                        </p>
                    </div>
                    {isLogin ? <LoginForm /> : <RegisterForm />}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            >
                                {isLogin ? 'Register' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}