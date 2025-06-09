"use client"
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, MessageCircleIcon, PhoneIcon, BookOpenIcon, MapPinned } from 'lucide-react';
export default function HelpCenterSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const faqs = [{
        question: 'How do I change my password?',
        answer: "To change your password, go to the Profile tab in your settings, scroll down to the Security section, and click on 'Change Password'. You'll need to enter your current password and then your new password twice to confirm."
    }, {
        question: 'How do I update my notification preferences?',
        answer: "You can update your notification preferences in the Notifications tab of your settings. There, you'll find options to manage email, push, and SMS notifications. Simply toggle on or off the types of notifications you want to receive."
    }, {
        question: 'How can I delete my account?',
        answer: 'To delete your account, please contact our support team. Account deletion is permanent and will remove all your data from our systems. You can reach out to us via chat, email, or phone from the Help Center.'
    }, {
        question: 'How do I subscribe to the premium plan?',
        answer: "To subscribe to our premium plan, go to the Billing section in your account settings. There, you'll see different plan options. Select the premium plan and follow the payment instructions to complete your subscription."
    }, {
        question: 'What happens to my data when I delete my account?',
        answer: 'When you delete your account, all your personal information and content will be permanently removed from our systems after a 30-day grace period. During this period, you can reactivate your account if you change your mind.'
    }];
    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };
    const filteredFaqs = faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return <div className=' w-[70%] mx-auto mt-[100px] min-h-screen'>
        <h2 className="text-3xl font-semibold mb-6">Help Center</h2>
        <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" placeholder="Search for help..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium mb-4">
                    Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                    {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                        <button onClick={() => toggleFaq(index)} className="flex justify-between items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100">
                            <span className="font-medium">{faq.question}</span>
                            {expandedFaq === index ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
                        </button>
                        {expandedFaq === index && <div className="px-4 py-3 bg-white">
                            <p className="text-gray-700">{faq.answer}</p>
                        </div>}
                    </div>) : <p className="text-gray-500">
                        No results found for "{searchQuery}"
                    </p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-4">Contact Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 ">
                    <div className="border border-gray-200 rounded-md p-4 flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <MessageCircleIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium mb-2">Chat Support</h4>
                        <p className="text-sm text-gray-500 mb-3">
                            Chat with our support team in email
                        </p>
                        <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium">
                            lehoahiepk9@gmail.com
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <PhoneIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium mb-2">Phone Support</h4>
                        <p className="text-sm text-gray-500 mb-3">
                            Call us Monday to Friday, 9am-5pm
                        </p>
                        <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium">
                            +84 867 797 248
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4 flex flex-col items-center text-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <MapPinned className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium mb-2">Company Address</h4>
                        <p className="text-sm text-gray-500 mb-3">
                            Visit us at our main office location
                        </p>
                        <button className="mt-auto text-blue-600 hover:text-blue-800 font-medium">
                            123 Nguyen Van Cu, District 5, Ho Chi Minh City
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>;
};