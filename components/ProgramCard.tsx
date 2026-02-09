import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Program } from '../types';
import { useCompare } from '../contexts/CompareContext';
import { Plus, Minus, ArrowRight, BookOpen, MapPin } from 'lucide-react';

interface ProgramCardProps {
    program: Program;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
    const navigate = useNavigate();
    const { addToCompare, removeFromCompare, isComparing } = useCompare();
    const isAddedToCompare = isComparing(program.program_id);

    const handleCompareToggle = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isAddedToCompare) {
            removeFromCompare(program.program_id);
        } else {
            if (!addToCompare(program)) {
                alert("You can compare a maximum of 4 programs.");
            }
        }
    }

    const handleCardClick = (e: React.PointerEvent | React.MouseEvent) => {
        
        if (e.type === 'click' && ((e as React.MouseEvent).ctrlKey || (e as React.MouseEvent).metaKey)) return;

        e.preventDefault();
        navigate(`/program/${program.program_id}`);
    };

    const collegeColorMap: Record<string, string> = {
        'College of Business': 'border-l-cyan-500',
        'College of Education': 'border-l-amber-500',
        'College of Liberal Arts': 'border-l-indigo-500',
        'College of Nursing and Health Sciences': 'border-l-rose-500',
        'College of Science and Engineering': 'border-l-emerald-500',
        'Pre-Professional Pathways': 'border-l-slate-500',
    };

    const collegeGlowMap: Record<string, string> = {
        'College of Business': 'glow-cyan',
        'College of Education': 'glow-amber',
        'College of Liberal Arts': 'glow-indigo',
        'College of Nursing and Health Sciences': 'glow-rose',
        'College of Science and Engineering': 'glow-emerald',
        'Pre-Professional Pathways': 'glow-slate',
    };

    const locations = program.location.split(';').map(l => l.trim()).join(' & ');
    
    const borderColorClass = collegeColorMap[program.department?.college_name || ''] || 'border-l-gray-500';

    return (
        <div
            role="link"
            tabIndex={0}
            onPointerUp={handleCardClick}
            className="group relative block h-full touch-manipulation cursor-pointer"
        >
            <div className={`h-full bg-white p-6 rounded-lg border border-gray-200 border-l-4 ${borderColorClass} transition-all duration-300 mouse:group-hover:shadow-lg mouse:group-hover:-translate-y-1 shadow-sm`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <span className="font-body bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary-200">{program.expanded_degree_type || program.degree_type}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">{program.program_name}</h3>
                    <p className="text-sm text-gray-600 mb-4 font-body">{program.department?.department_name}</p>

                    <p className="text-sm text-gray-700 flex-grow font-body">
                        {program.short_description}
                    </p>

                    <div className="my-6 space-y-2 text-sm font-body">
                        <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen size={16} /> <span>{program.program_credits} Program / {program.total_credits} Total</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} /> <span>{locations}</span>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center">
                        <div className="font-body flex items-center gap-2 font-semibold text-primary-600 group-hover:text-primary-500 transition-colors">
                            View Details <ArrowRight size={16} className="transition-transform mouse:group-hover:translate-x-1" />
                        </div>
                        <button
                            type="button"
                            onPointerUp={handleCompareToggle}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation shadow-sm ${isAddedToCompare ? 'bg-primary-600 text-white mouse:hover:bg-red-500 mouse:hover:rotate-90' : 'bg-gray-100 text-gray-600 opacity-100 mouse:opacity-0 mouse:group-hover:opacity-100 mouse:hover:bg-primary-600 mouse:hover:text-white border border-gray-200'}`}
                            aria-label={isAddedToCompare ? "Remove from Compare" : "Add to Compare"}
                            title={isAddedToCompare ? "Remove from Compare" : "Add to Compare"}
                        >
                            {isAddedToCompare ? <Minus size={18} /> : <Plus size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramCard;
