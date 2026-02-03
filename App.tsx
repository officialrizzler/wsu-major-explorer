
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompareProvider } from './contexts/CompareContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import ComparePage from './pages/ComparePage';
import AdvisorPage from './pages/AdvisorPage';
import AboutPage from './pages/AboutPage';

import ScrollToTop from './components/ScrollToTop';

function useTapDebug() {
    React.useEffect(() => {
        const handler = (e: Event) => {
            const t = e.target as HTMLElement | null;
            if (!t) return;

            // highlight the element briefly
            const prev = t.style.outline;
            t.style.outline = "3px solid red";
            setTimeout(() => (t.style.outline = prev), 300);

            console.log("TAP:", t.tagName, t.className);
        };

        window.addEventListener("pointerdown", handler, true);
        return () => window.removeEventListener("pointerdown", handler, true);
    }, []);
}

const App: React.FC = () => {
    useTapDebug();
    return (
        <ThemeProvider>
            <DataProvider>
                <CompareProvider>
                    <HashRouter>
                        <ScrollToTop />
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<LandingPage />} />
                                <Route path="explore" element={<ExplorePage />} />
                                <Route path="program/:programId" element={<ProgramDetailPage />} />
                                <Route path="compare" element={<ComparePage />} />
                                <Route path="advisor" element={<AdvisorPage />} />
                                <Route path="about" element={<AboutPage />} />
                            </Route>
                        </Routes>
                    </HashRouter>
                </CompareProvider>
            </DataProvider>
        </ThemeProvider>
    );
};

export default App;
