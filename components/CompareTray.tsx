import React from 'react';
import { useCompare } from '../contexts/CompareContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Scale, Trash2 } from 'lucide-react';

const CompareTray: React.FC = () => {
    const { compareList, removeFromCompare, clearCompare, isTrayVisible, setIsTrayVisible } = useCompare();
    const navigate = useNavigate();
    const location = useLocation();

    if (compareList.length === 0) {
        return null;
    }

    
    if (location.pathname === '/compare') {
        return null;
    }

    const handleCompare = () => {
        if (compareList.length > 0) {
            navigate('/compare');
        }
    };

    if (!isTrayVisible) {
        return (
            <button
                onClick={() => setIsTrayVisible(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center mouse:hover:bg-primary-500 transition-all animate-fade-in group"
                aria-label="Show comparison tray"
            >
                <Scale size={24} />
                <span className="absolute -top-1 -right-1 bg-white text-primary-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary-600 shadow-sm">
                    {compareList.length}
                </span>
                <span className="absolute right-full mr-3 px-2 py-1 bg-white border border-gray-200 text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block shadow-md">
                    View Comparison
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:bottom-6 sm:right-6 sm:left-auto sm:w-11/12 sm:max-w-md animate-fade-in-up">
            <div className="bg-white shadow-2xl overflow-hidden sm:rounded-xl border-t border-gray-200 sm:border relative backdrop-blur-xl bg-white/95">

                {}
                <button
                    onClick={() => setIsTrayVisible(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-50 p-1"
                    aria-label="Hide comparison tray"
                >
                    <X size={20} />
                </button>

                {}
                <div className="sm:hidden px-4 py-4 pr-12">
                    <div className="flex justify-between items-center flex-nowrap">
                        <div className="flex items-baseline gap-2 flex-shrink-0 mr-2 min-w-0">
                            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">Compare Programs</span>
                            <span className="text-xs text-gray-500 font-body whitespace-nowrap">({compareList.length}/4)</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={handleCompare}
                                className="font-body flex items-center gap-2 px-4 py-2 border border-transparent text-xs font-semibold rounded-md text-white bg-primary-600"
                            >
                                <Scale size={14} />
                                View
                            </button>
                        </div>
                    </div>
                </div>

                {}
                <div className="hidden sm:block p-5 pr-12">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Scale size={20} className="text-primary-600" />
                            <h3 className="text-base font-semibold text-gray-900">Compare Programs ({compareList.length}/4)</h3>
                        </div>
                        <button
                            onClick={clearCompare}
                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold"
                            aria-label="Clear all comparison items"
                        >
                            <Trash2 size={12} /> Clear All
                        </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar mb-4">
                        {compareList.map(program => (
                            <div key={program.program_id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-2 rounded-lg group hover:bg-white hover:shadow-sm transition-all">
                                <span className="text-xs font-medium text-gray-700 truncate font-body">{program.program_name}</span>
                                <button
                                    onClick={() => removeFromCompare(program.program_id)}
                                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                    aria-label={`Remove ${program.program_name} from comparison`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={compareList.length < 2}
                        className="font-body w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md text-white bg-primary-600 mouse:hover:bg-primary-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                    >
                        {compareList.length < 2 ? 'Add one more to compare' : `Compare Side-by-Side (${compareList.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompareTray;