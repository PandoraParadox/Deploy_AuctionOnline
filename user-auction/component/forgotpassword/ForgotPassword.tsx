import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { XIcon, MailIcon, ArrowRightIcon } from 'lucide-react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebase';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Email',
                text: 'Please enter your email address.',
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSuccess(true);
            await Swal.fire({
                icon: 'success',
                title: 'Email Sent',
                text: 'Password reset instructions have been sent to your email.',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (err) {
            console.log(err);
            await Swal.fire({
                icon: 'error',
                title: 'Failed to Send Email',
                text: 'There was an issue sending the password reset email. Please check the email address and try again.',
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" aria-label="Close">
                    <XIcon size={20} />
                </button>
                <div className="p-6">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900 mb-1">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MailIcon size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="email@example.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Send Request
                                        <ArrowRightIcon size={16} className="ml-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MailIcon size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
                            <p className="text-gray-600 mb-4">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <button onClick={onClose} className="text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer">
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
