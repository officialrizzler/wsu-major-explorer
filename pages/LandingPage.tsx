import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import DynamicBackground from '../components/DynamicBackground';
import WhyWinona from '../components/WhyWinona';

const LandingPage: React.FC = () => {
    return (
        <div className="w-full">
            <Helmet>
                <title>Winona State Explorer | Winona State Degrees & Programs</title>
                <meta name="description" content="Explore details on 200+ Winona State University majors, minors, and degrees. Compare programs, view requirements, and find your perfect fit." />
                <link rel="canonical" href="https://explorewsu.vercel.app/" />
            </Helmet>

            {/* Hero Section */}
            <DynamicBackground className="relative isolate">
                <div className="min-h-[calc(65vh)] flex items-center justify-center spotlight relative z-10 px-6 py-20">
                    <div className="text-center w-full max-w-6xl">
                        <div className="mx-auto">
                            <h1 className="text-6xl font-black tracking-tight text-gray-950 sm:text-7xl lg:text-8xl animate-fade-in-up leading-[1.1]">
                                Major Decisions,<br />
                                Made Simpler.
                            </h1>

                            <p className="mt-12 text-xl sm:text-2xl leading-relaxed text-gray-800 font-medium max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
                                We did the research so you don't have to. Discover programs, compare side-by-side, and get AI powered insights to help you navigate your options with ease.
                            </p>

                            <div className="mt-12 flex items-center justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <Link
                                    to="/explore"
                                    className="font-body w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gray-900 px-12 py-5 text-xl font-bold text-white shadow-2xl hover:bg-gray-800 transition-all hover:scale-[1.05] active:scale-[0.98] ring-4 ring-gray-900/10"
                                >
                                    <Search size={24} strokeWidth={3} />
                                    Start Exploring
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DynamicBackground>

            {/* Why Winona Narrative Section */}
            <WhyWinona />
        </div>
    );
};

export default LandingPage;