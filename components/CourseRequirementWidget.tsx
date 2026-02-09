
import React, { useMemo } from 'react';
import { CourseGroup, Course, CourseText } from '../types';
import { BookOpen, AlertCircle, Calendar } from 'lucide-react';

interface CourseRequirementWidgetProps {
    courseStructure: CourseGroup[];
}

const cleanText = (text: string) => {
    if (!text) return '';
    
    let cleaned = text.replace(/[△*^†‡§#◆◇♦◎]/g, '').trim();

    
    
    
    
    
    
    
    
    cleaned = cleaned.replace(/\s*\((?:[^)]*?\s+)?\d+(?:-\d+)?\s*credits?\)\s*$/i, '').trim();

    
    cleaned = cleaned.replace(/^- /, '').trim();

    
    if (cleaned.toLowerCase() === 'major requirements') return 'Program Requirements';

    
    if (cleaned.toLowerCase().includes('data may be outdated') || /20\d{2}-20\d{2} data/i.test(cleaned)) {
        return '';
    }

    return cleaned;
};

const extractCredits = (name: string) => {
    
    const match = name.match(/\((?:[^)]*?\s+)?(\d+(?:-\d+)?)\s*credits?\)/i);
    return match ? match[1] : null;
};


const CourseItem: React.FC<{ item: Course | CourseText }> = ({ item }) => {
    if (item.type === 'text') {
        const cleanedContent = cleanText(item.content);
        if (!cleanedContent) return null;
        return <div className="py-1 px-2 text-gray-500 italic text-[11px] border-l border-gray-300 ml-1 mb-1">{cleanedContent}</div>;
    }

    let cleanedTitle = cleanText(item.course_title);
    let courseId = item.course_id;

    
    if (!courseId || cleanedTitle.includes(courseId)) {
        
        
        const match = cleanedTitle.match(/^([A-Z]{2,4}\s*\d{3}[A-Z]*)\s*[-:–]?\s*(.*)$/);
        if (match) {
            courseId = match[1];
            cleanedTitle = match[2];
        } else if (cleanedTitle.includes(' - ')) {
            const parts = cleanedTitle.split(' - ');
            if (parts[0].match(/[A-Z]+\s+\d+/)) {
                courseId = parts[0].trim();
                cleanedTitle = parts.slice(1).join(' - ').trim();
            }
        }
    }

    return (
        <div className="flex items-start gap-2 p-1.5 bg-white/60 border border-gray-200 transition-colors hover:bg-gray-50 shadow-sm rounded-md">
            <div className="min-w-0 flex-grow">
                {courseId && <div className="font-bold text-gray-900 text-xs leading-tight">{courseId}</div>}
                <div className="text-[11px] text-gray-600 leading-tight mt-0.5">{cleanedTitle}</div>
            </div>
            {item.credits && (
                <div className="self-center text-[10px] font-bold text-gray-700 px-2 py-1 border border-gray-200 uppercase tracking-wider shrink-0 bg-gray-100 rounded-sm min-w-[45px] text-center shadow-sm">
                    {item.credits.replace(/[a-z]/gi, '').trim()} CR
                </div>
            )}
        </div>
    );
};



const getHeaderStyle = (depth: number) => {
    switch (depth) {
        case 0: return "text-sm font-black text-gray-900 mb-2 mt-6 first:mt-0 border-b border-gray-200 pb-1 uppercase tracking-widest";
        case 1: return "text-xs font-bold text-gray-700 mb-1 mt-3 uppercase tracking-wider";
        default: return "text-[10px] font-bold text-gray-500 mb-1 mt-2 uppercase";
    }
};

const RecursiveSection: React.FC<{ group: CourseGroup; depth: number }> = ({ group, depth }) => {
    
    const cleanedName = cleanText(group.group_name);

    
    const creditsFromHeader = extractCredits(group.group_name);
    let displayCredits = group.credits_required || creditsFromHeader;

    return (
        <div className={`flex flex-col ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-blue-500/10 hover:border-blue-500/30 transition-colors' : ''}`}>
            {cleanedName && (
                <div className={`flex items-center justify-between pr-1.5 ${getHeaderStyle(depth)}`}>
                    <span className="flex-grow mr-2">{cleanedName}</span>
                    {displayCredits && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-1 border bg-amber-50 text-amber-700 border-amber-200 rounded-sm">
                            {depth > 0 ? `CHOOSE ${displayCredits} CR` : `${displayCredits} CR`}
                        </span>
                    )}
                </div>
            )}

            {}
            {group.notes && group.notes.length > 0 && (
                <div className="mb-2 space-y-1">
                    {group.notes.map((note, idx) => (
                        <p key={idx} className="text-[10px] text-blue-600 italic pl-1">{note}</p>
                    ))}
                </div>
            )}

            {}
            <div className="space-y-1 mb-2">
                {group.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <CourseItem item={item} />
                    </React.Fragment>
                ))}
            </div>

            {}
            {group.subgroups && group.subgroups.length > 0 && (
                <div className="space-y-2">
                    {group.subgroups.map((sub, idx) => (
                        <RecursiveSection key={idx} group={sub} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseRequirementWidget: React.FC<CourseRequirementWidgetProps> = ({ courseStructure }) => {
    const catalogTimeline = useMemo(() => {
        const extract = (structure: CourseGroup[]): string | null => {
            for (const group of structure) {
                for (const item of group.items) {
                    if (item.type === 'text') {
                        const match = item.content.match(/(20\d{2})-(20\d{2}|\d{2})/);
                        if (match) {
                            const year1 = parseInt(match[1]);
                            const year2 = match[2].length === 2 ? parseInt(`20${match[2]}`) : parseInt(match[2]);

                            
                            
                            if (year2 === year1 + 1) {
                                return `${year1}-${year2}`;
                            }
                        }
                    }
                }
                if (group.subgroups) {
                    const result = extract(group.subgroups);
                    if (result) return result;
                }
            }
            return null;
        };
        return extract(courseStructure) || "2024-2025";
    }, [courseStructure]);

    if (!courseStructure || courseStructure.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 px-1">
                <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Academic Year</span>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-tighter ${catalogTimeline.includes('2025-2026') ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {catalogTimeline} WSU Catalog
                </span>
            </div>

            <div className="animate-fade-in space-y-6">
                {courseStructure.map((group, idx) => (
                    <RecursiveSection key={idx} group={group} depth={0} />
                ))}
            </div>
        </div>
    );
};

export default CourseRequirementWidget;
