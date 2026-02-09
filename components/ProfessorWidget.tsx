import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface Professor {
    name: string;
    title: string;
    rmp_id?: number;
    avg_rating?: number;
    num_ratings?: number;
    would_take_again_percent?: number;
    rmp_url?: string;
}

interface ProfessorWidgetProps {
    departmentId: string;
    professorsData: Record<string, Professor[]>;
}

const ProfessorWidget: React.FC<ProfessorWidgetProps> = ({ departmentId, professorsData }) => {
    const professors = professorsData[departmentId] || [];

    if (professors.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Star className="text-blue-500 fill-blue-500/20" size={16} />
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                        Related Faculty
                    </h3>
                </div>
                <div className="flex gap-1.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-tighter">Winona.edu</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-tighter">RateMyProfessor</span>
                </div>
            </div>

            <div className="space-y-3">
                {professors.slice(0, 3).map((prof, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all group"
                    >
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                {}
                                <div className="text-gray-900 font-bold text-sm leading-tight">
                                    {prof.name}
                                </div>

                                {}
                                <div className="text-gray-500 text-[11px] mt-0.5 leading-tight font-medium">
                                    {prof.title}
                                </div>
                            </div>

                            {}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    <span className="text-blue-600 font-bold text-xs">
                                        {prof.avg_rating && prof.avg_rating > 0 ? prof.avg_rating.toFixed(1) : 'N/A'}
                                    </span>
                                    <Star className="text-blue-500 fill-blue-500" size={10} />
                                </div>
                                <span className="text-gray-400 text-[9px] mt-0.5 font-medium">
                                    {prof.num_ratings || 0} reviews
                                </span>
                            </div>
                        </div>

                        {}
                        {(prof.would_take_again_percent && prof.would_take_again_percent > 0) || prof.rmp_url ? (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                                {prof.would_take_again_percent && prof.would_take_again_percent > 0 ? (
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                                        {prof.would_take_again_percent.toFixed(0)}% would take again
                                    </div>
                                ) : <div></div>}

                                {prof.rmp_url && (
                                    <a
                                        href={prof.rmp_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-500 transition-colors group-hover:underline decoration-blue-500/30 uppercase font-bold tracking-wide"
                                    >
                                        View on RMP
                                        <ExternalLink size={8} />
                                    </a>
                                )}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfessorWidget;
