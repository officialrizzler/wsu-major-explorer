import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import DynamicBackground from '../components/DynamicBackground';
import WhyWinona from '../components/WhyWinona';

const LandingPage: React.FC = () => {
    return (
        <div className="w-full">
            <Helmet>
                <title>WSU Explorer | Winona State Degrees & Programs</title>
                <meta name="description" content="Explore details on 200+ Winona State University majors, minors, and degrees. Compare programs, view requirements, and find your perfect fit." />
                <link rel="canonical" href="https://explorewsu.vercel.app/" />
            </Helmet>

            {/* Hero Section */}
            <DynamicBackground className="relative isolate min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-7xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-6 sm:p-12 text-center animate-fade-in-up border border-white/20 relative z-10">
                    <div className="space-y-8">
                        {/* WSU Badge */}
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-primary-100 shadow-sm">
                            <span className="text-[10px] font-black tracking-[0.2em] text-primary-600 uppercase">
                                Winona State Explorer
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-gray-950 leading-[1.05]">
                                Major Decisions<br />
                                Made Simpler.
                            </h1>

                            <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                                Discover programs, compare side-by-side, and get AI powered insights to help you navigate your options with ease.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link
                                to="/advisor"
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Sparkles size={18} className="text-white/80" />
                                Ask AI Advisor
                            </Link>
                            <Link
                                to="/explore"
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-white border border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Search size={18} className="text-gray-400" />
                                Start Exploring
                            </Link>
                        </div>

                        {/* Footer text inside window */}
                        <p className="text-xs text-gray-400 font-medium pt-2">
                            Use the AI Advisor to ask questions about WSU, or start exploring over 200 academic programs.
                        </p>
                    </div>
                </div>
            </DynamicBackground>

            {/* Why Winona Narrative Section */}
            <WhyWinona />
        </div>
    );
};

export default LandingPage;