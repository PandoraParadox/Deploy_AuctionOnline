'use client';
import React, { useState } from 'react';
import { GoogleAuthButton } from '../google/AppGoogle';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export const RegisterForm = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            document.cookie = `idToken=${idToken}; path=/`;
            await Swal.fire({
                title: 'Success!',
                text: 'Account created successfully',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });
            const data = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/api/v1/wallet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    user_id: user.uid
                })
            });
            if (!data.ok) {
                const error = await data.json().catch(() => ({}));
                throw new Error(error || data.status);
            }
            router.push('/');
        } catch (error: any) {
            await Swal.fire({
                title: 'Error!',
                text: 'Registration failed',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters
                    </p>
                </div>
                <div className="flex items-center">
                    <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-800">
                            Terms
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-800">
                            Privacy Policy
                        </a>
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-yellow-500 duration-200 hover:scale-105 cursor-pointer hover:text-black"
                >
                    Register
                </button>
            </form>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or register with</span>
                    </div>
                </div>
                <div className="mt-6">
                    <GoogleAuthButton />
                </div>
            </div>
        </div>
    );
};