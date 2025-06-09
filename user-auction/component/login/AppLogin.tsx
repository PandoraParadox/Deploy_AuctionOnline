'use client';
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { GoogleAuthButton } from '../google/AppGoogle';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ForgotPasswordModal } from '../forgotpassword/ForgotPassword';
export const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPass, setShowForgotPass] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            document.cookie = `idToken=${idToken}; path=/`;
        } catch (error: any) {
            console.log('Login failed:', error.code, error.message);

            await Swal.fire({
                title: 'Login fail',
                icon: 'error',
                showConfirmButton: false,
                timer: 1000
            });
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                    <div>
                        <a onClick={() => setShowForgotPass(true)} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            Forgot password?
                        </a>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-yellow-500 duration-200 hover:scale-105 cursor-pointer hover:text-black"
                >
                    Login
                </button>
            </form>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or login with</span>
                    </div>
                </div>
                <div className="mt-6">
                    <GoogleAuthButton />
                </div>
            </div>
            {showForgotPass && <ForgotPasswordModal onClose={() => setShowForgotPass(false)} />}
        </div>
    );
};