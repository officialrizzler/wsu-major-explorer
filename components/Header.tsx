import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';


const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `text-sm transition-colors font-normal ${isActive
            ? 'text-gray-900 font-semibold'
            : 'text-gray-500 hover:text-gray-900'
        }`;

    const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `block py-2 px-3 rounded-md text-base font-medium ${isActive ? 'bg-primary-100 text-primary-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300">
                <div className="relative flex items-center justify-between h-16 transition-all duration-300">
                    { }
                    <div className="flex items-center transition-all duration-300 ease-in-out">
                        <div
                            role="link"
                            tabIndex={0}
                            onPointerUp={(e) => {
                                e.preventDefault();
                                navigate('/');
                            }}
                            className="flex items-center gap-3 group relative z-20 touch-manipulation cursor-pointer"
                        >
                            <div className="p-2 rounded-lg border border-gray-200 bg-white/50 transition-all duration-300">
                                <GraduationCap className="text-primary-600" size={24} />
                            </div>
                            <span className="text-gray-900 text-lg font-semibold tracking-tight transition-all duration-300 hidden lg:block">
                                WSU Explorer
                            </span>
                        </div>
                    </div>

                    { }
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                        <nav className="flex items-center space-x-10">
                            <NavLink to="/explore" className={navLinkClasses}>
                                Catalog
                            </NavLink>
                            <NavLink to="/compare" className={navLinkClasses}>
                                Compare
                            </NavLink>
                            <NavLink to="/advisor" className={navLinkClasses}>
                                Advisor
                            </NavLink>
                            <NavLink to="/about" className={navLinkClasses}>
                                About
                            </NavLink>
                        </nav>
                    </div>

                    { }
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="md:hidden">
                            <button
                                onPointerUp={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 active:text-gray-900 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors touch-manipulation"
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {['/explore', '/compare', '/advisor', '/about'].map((path) => {
                            const name = path.substring(1).charAt(0).toUpperCase() + path.substring(2);
                            const isActive = location.pathname === path;
                            return (
                                <div
                                    key={path}
                                    role="link"
                                    tabIndex={0}
                                    className={mobileNavLinkClasses({ isActive })}
                                    onPointerUp={(e) => {
                                        e.preventDefault();
                                        navigate(path);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {path === '/explore' ? 'Catalog' : name}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
