import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import CompareTray from './CompareTray';
import Footer from './Footer';

const Layout: React.FC = () => {
    const location = useLocation();
    const isComparePage = location.pathname === '/compare';

    return (
        <div className="min-h-screen bg-[#f5f5f7] text-gray-900 font-body transition-colors duration-300 flex flex-col">
            <Header />
            <main className="pt-16 flex-1 min-h-0 flex flex-col">
                <Outlet />
            </main>
            {}
            {!isComparePage && <CompareTray />}
            <Footer />
        </div>
    );
};

export default Layout;