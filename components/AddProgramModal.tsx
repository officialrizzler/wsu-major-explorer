
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useCompare } from '../contexts/CompareContext';
import { Program } from '../types';

interface AddProgramModalProps {
    onClose: () => void;
}

const AddProgramModal: React.FC<AddProgramModalProps> = ({ onClose }) => {
    const { programs } = useData();
    const { addToCompare, isComparing, compareList } = useCompare();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredPrograms = useMemo(() => {
        const results = programs.filter(p =>
            p.program_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !isComparing(p.program_id)
        );
        return results;
    }, [programs, searchTerm, isComparing]);

    const handleAdd = (program: Program) => {
        if (!addToCompare(program)) {
            alert("You can compare a maximum of 4 programs.");
        }
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)' }}
            onClick={handleClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-800 transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white">Add Program to Comparison ({compareList.length}/4)</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-4 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="font-body w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:border-primary-500"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="px-4 pb-2 flex-grow overflow-y-auto custom-scrollbar">
                    <ul className="space-y-1">
                        {filteredPrograms.map(p => (
                            <li key={p.program_id} className="flex justify-between items-center py-3 px-2 rounded-md hover:bg-gray-800 transition-colors group">
                                <div className="flex-1 min-w-0 mr-4 text-left">
                                    <p className="font-body truncate font-medium text-white">{p.program_name}</p>
                                    <p className="font-body text-xs text-gray-400">{p.department?.college_name}</p>
                                </div>
                                <button
                                    onClick={() => handleAdd(p)}
                                    className="flex-shrink-0 text-primary-500 hover:text-primary-400 text-sm font-semibold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                >
                                    Add
                                </button>
                            </li>
                        ))}
                        {filteredPrograms.length === 0 && (
                            <li className="py-8 text-center text-gray-500 font-body italic">
                                No matching programs found.
                            </li>
                        )}
                    </ul>
                </div>
                <div className="p-4 border-t border-gray-800 flex-shrink-0">
                    <button onClick={handleClose} className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-body font-medium transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

export default AddProgramModal;
