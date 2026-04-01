import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 gap-x-12 gap-y-10 lg:grid-cols-4 lg:gap-x-16 items-start">
                    <div className="col-span-2 lg:col-span-1 text-left flex flex-col gap-4">
                        <div className="min-h-9 flex items-center">
                            <Link to="/" className="text-gray-900 text-[18px] font-semibold tracking-tight leading-none">
                                WSU Explorer
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 font-body max-w-[22rem] leading-relaxed">
                            Helping students find their path at Winona State University.
                        </p>
                    </div>
                    <div className="col-span-1 text-left flex flex-col gap-4">
                        <div className="min-h-9 flex items-center">
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase leading-none">Navigation</h3>
                        </div>
                        <ul className="space-y-2 text-sm font-body leading-relaxed">
                            <li><Link to="/explore" className="text-gray-500 hover:text-primary-600 transition-colors">Explore Programs</Link></li>
                            <li><Link to="/compare" className="text-gray-500 hover:text-primary-600 transition-colors">Compare Tool</Link></li>
                            <li><Link to="/advisor" className="text-gray-500 hover:text-primary-600 transition-colors">AI Advisor</Link></li>
                            <li><Link to="/about" className="text-gray-500 hover:text-primary-600 transition-colors">About the Data</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-1 text-left flex flex-col gap-4">
                        <div className="min-h-9 flex items-center">
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase leading-none">Official Links</h3>
                        </div>
                        <ul className="space-y-2 text-sm font-body leading-relaxed">
                            <li><a href="https://www.winona.edu/academics/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">WSU Academics</a></li>
                            <li><a href="https://www.winona.edu/advising/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">Advising Services</a></li>
                            <li><a href="https://www.winona.edu/admissions/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">Admissions</a></li>
                            <li><a href="https://www.winona.edu/studentservices/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 transition-colors">Student Services</a></li>
                        </ul>
                    </div>
                    <div className="col-span-2 lg:col-span-1 text-left flex flex-col gap-4">
                        <div className="min-h-9 flex items-center">
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase leading-none">Disclaimer</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-body leading-relaxed max-w-[22rem]">
                            This tool is for informational purposes only. Always confirm program details, tuitions, and availability with an official WSU academic advisor before making decisions.
                        </p>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 font-body">
                        &copy; {new Date().getFullYear()} WSU Explorer. An independent project, not an official WSU resource.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
