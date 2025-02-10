'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { login } from '../../../../services/auth';  // Import login from your auth service

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Call the login function from auth service
            const data = await login(formData.email, formData.password);

            if (data.status) {
                // Redirect on successful login
                router.push('/profile');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-backgroundc p-4">
            <div className="w-full max-w-md">
                <form 
                    onSubmit={handleSubmit}
                    className="bg-componentbgc shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-textc/10"
                >
                    <h1 className="text-2xl font-bold text-textc mb-6 text-center">Login</h1>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-textc/80 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full p-3 bg-backgroundc border border-textc/20 rounded focus:border-primaryc focus:outline-none text-textc"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-textc/80 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full p-3 bg-backgroundc border border-textc/20 rounded focus:border-primaryc focus:outline-none text-textc"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full bg-primaryc hover:bg-primaryc/90 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
