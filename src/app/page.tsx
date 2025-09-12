"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
            <div className="max-w-2xl mx-auto pt-20">
                {/* Notebook-style container */}
                <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-200 relative">
                    {/* Notebook Lines Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent bg-[length:100%_24px] bg-repeat-y" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #3b82f6 23px, #3b82f6 24px)' }}></div>
                    </div>

                    {/* Red Margin Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300 opacity-30"></div>

                    <div className="relative px-8 py-12">
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <div className="mb-6">
                                <h1 className="text-5xl font-bold text-gray-800 mb-4">TodoApp</h1>
                                <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                            </div>
                            <p className="text-xl text-gray-600 mb-2">
                                Organize your life, one task at a time
                            </p>
                            <p className="text-gray-500">
                                A beautiful, intuitive way to manage your daily tasks and boost productivity
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Easy Organization</h3>
                                <p className="text-sm text-gray-600">Drag, drop, and organize your tasks effortlessly</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Secure & Private</h3>
                                <p className="text-sm text-gray-600">Your tasks are safe and only visible to you</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">Lightning Fast</h3>
                                <p className="text-sm text-gray-600">Real-time sync and instant updates</p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push("/sign-up")}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-lg"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => router.push("/sign-in")}
                                className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                            >
                                Already have an account? Sign In
                            </button>
                        </div>

                        {/* Footer note */}
                        <div className="text-center mt-8 pt-6 border-t border-amber-200">
                            <p className="text-gray-500 text-sm">
                                Join thousands of users who have organized their lives with TodoApp
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}