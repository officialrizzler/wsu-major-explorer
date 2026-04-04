
import React, { useMemo } from 'react';
import { CourseGroup, Course, CourseText } from '../types';
import { BookOpen, Calendar, CheckCircle2, AlertCircle, ArrowRight, Layers, FileText, Compass, GraduationCap, Info, ListChecks } from 'lucide-react';

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

const CourseItem: React.FC<{ item: Course | CourseText, index: number }> = ({ item, index }) => {
    if (item.type === 'text') {
        const cleanedContent = cleanText(item.content);
        if (!cleanedContent) return null;

        const isInstruction = /choose|select|must|required|minimum|maximum|complete/i.test(cleanedContent);
        if (isInstruction) {
            return (
                <div className="inline-flex items-center justify-center px-2.5 py-1 my-2 rounded-md border bg-amber-100 text-amber-900 border-amber-200 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        {cleanedContent}
                    </span>
                </div>
            );
        }

        return (
            <div className="relative px-5 py-4 my-3 rounded-2xl border bg-white border-gray-200 text-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                        <Info size={14} />
                    </div>
                    <span className="leading-relaxed text-[13px] font-medium">{cleanedContent}</span>
                </div>
            </div>
        );
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
        <div className="group relative w-full bg-white rounded-2xl border border-gray-200 hover:border-primary-400 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 overflow-hidden my-2">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-200 group-hover:bg-primary-500 transition-colors duration-300" />

            <div className="flex justify-between gap-4 pl-2">
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                    {courseId && (
                        <div className="font-sans text-xs font-black tracking-widest text-primary-600 uppercase mb-1">
                            {courseId}
                        </div>
                    )}
                    <div className="text-[14px] font-bold text-gray-900 leading-snug group-hover:text-primary-950 transition-colors whitespace-normal">
                        {cleanedTitle}
                    </div>
                </div>

                {item.credits && (
                    <div className="shrink-0 flex items-center">
                        <div className="flex flex-col items-center justify-center min-w-[70px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors shadow-sm">
                            <span className="text-[15px] font-black tabular-nums text-gray-800 group-hover:text-primary-700 leading-none">
                                {item.credits.replace(/[a-z]/gi, '').trim()}
                            </span>
                            <span className="text-[8px] font-black text-gray-500 group-hover:text-primary-600 uppercase tracking-widest mt-0.5">
                                Credits
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const getThemeForDepth = (depth: number, name: string) => {
    const n = name.toLowerCase();

    if (depth === 0) {
        if (n.includes('core')) return { bg: 'bg-indigo-50/80', text: 'text-indigo-900', border: 'border-indigo-100', badge: 'bg-white text-indigo-700 border-indigo-200 shadow-sm' };
        if (n.includes('general') || n.includes('gep')) return { bg: 'bg-purple-50/80', text: 'text-purple-900', border: 'border-purple-100', badge: 'bg-white text-purple-700 border-purple-200 shadow-sm' };
        if (n.includes('elective')) return { bg: 'bg-emerald-50/80', text: 'text-emerald-900', border: 'border-emerald-100', badge: 'bg-white text-emerald-700 border-emerald-200 shadow-sm' };
        return { bg: 'bg-gray-50/80', text: 'text-gray-900', border: 'border-gray-200', badge: 'bg-white text-gray-700 border-gray-200 shadow-sm' };
    }

    return { bg: 'bg-transparent', text: 'text-gray-900', border: 'border-transparent', badge: 'bg-amber-100 text-amber-900 border-amber-200 shadow-sm' };
};

const SectionHeader: React.FC<{ name: string, credits: string | null, depth: number }> = ({ name, credits, depth }) => {
    const theme = getThemeForDepth(depth, name);

    if (depth === 0) {
        return (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 mt-10 first:mt-2">
                <h3 className="font-sans text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
                    {name}
                </h3>
                {credits && (
                    <div className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${theme.badge}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider tabular-nums">
                            {credits}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 mt-8 first:mt-2">
            <h4 className="font-sans text-[12px] sm:text-[13px] font-black text-gray-800 uppercase tracking-widest pl-2">
                {name}
            </h4>

            {credits && (
                <div className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${theme.badge}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider tabular-nums">
                        Choose {credits} Credits
                    </span>
                </div>
            )}

            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent min-w-[30px]" />
        </div>
    );
};

const RecursiveSection: React.FC<{ group: CourseGroup; depth: number }> = ({ group, depth }) => {
    const cleanedName = cleanText(group.group_name);
    const creditsFromHeader = extractCredits(group.group_name);
    let displayCredits = group.credits_required || creditsFromHeader;

    if (!cleanedName && group.items.length === 0 && (!group.subgroups || group.subgroups.length === 0)) return null;

    return (
        <div className={`relative ${depth === 0 ? 'mb-12' : 'mb-6 pl-4 sm:pl-8'}`}>
            {depth > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 rounded-full" />
            )}

            {cleanedName && !(depth === 0 && (cleanedName.toLowerCase().includes('required courses') || cleanedName.toLowerCase().includes('program requirements'))) && (
                <div className="relative">
                    <SectionHeader name={cleanedName} credits={displayCredits} depth={depth} />
                </div>
            )}

            {group.notes && group.notes.length > 0 && (
                (() => {
                    const filteredNotes = group.notes.filter(note => {
                        const n = note.toLowerCase();
                        // If it's a simple instruction like "Choose one" or "Select from", it's redundant with our badge
                        if ((n.includes('choose') || n.includes('select')) && n.length < 25) return false;
                        return true;
                    });

                    if (filteredNotes.length === 0) return null;

                    return (
                        <div className="my-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                            <h5 className="font-sans text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3 flex items-center gap-2">
                                <Info size={14} /> Notes
                            </h5>
                            <div className="space-y-3">
                                {filteredNotes.map((note, idx) => (
                                    <p key={idx} className="text-[13px] text-gray-600 font-medium leading-relaxed pl-1">
                                        {note}
                                    </p>
                                ))}
                            </div>
                        </div>
                    );
                })()
            )}

            {group.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                    {group.items.map((item, idx) => (
                        <div key={idx} className={item.type === 'text' ? 'md:col-span-2' : ''}>
                            <CourseItem item={item} index={idx} />
                        </div>
                    ))}
                </div>
            )}

            {group.subgroups && group.subgroups.length > 0 && (
                <div className="mt-6 flex flex-col space-y-2">
                    {group.subgroups.map((sub, idx) => (
                        <RecursiveSection key={idx} group={sub} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseRequirementWidget: React.FC<{ courseStructure: CourseGroup[] }> = ({ courseStructure }) => {
    const catalogTimeline = useMemo(() => {
        const extract = (structure: CourseGroup[]): string | null => {
            for (const group of structure) {
                for (const item of group.items) {
                    if (item.type === 'text') {
                        const match = item.content.match(/(20\d{2})-(20\d{2}|\d{2})/);
                        if (match) {
                            const year1 = parseInt(match[1]);
                            const year2 = match[2].length === 2 ? parseInt(`20${match[2]}`) : parseInt(match[2]);
                            if (year2 === year1 + 1) return `${year1}-${year2}`;
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
        <div className="font-body w-full max-w-5xl mx-auto -mt-2">
            <div className="space-y-4">
                {courseStructure.map((group, idx) => (
                    <RecursiveSection key={idx} group={group} depth={0} />
                ))}
            </div>

        </div>
    );
};

export default CourseRequirementWidget;

