
import React from 'react';
import { CourseGroup, Course, CourseText } from '../types';
import { Info } from 'lucide-react';

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

const normalizeDisplayTitle = (courseId: string | undefined, title: string) => {
    if (!title) return title;
    const trimmed = title.trim();

    // Common catalog shorthand: "/400-level course" paired with "MIS 300"
    const slashLevel = trimmed.match(/^\/\s*(\d{3,4}-level course.*)$/i);
    if (slashLevel && courseId) {
        const idLevel = courseId.match(/\b(\d{3,4})\b/);
        if (idLevel) return `${idLevel[1]}/${slashLevel[1]}`.replace(/\s+/g, ' ').trim();
    }

    return trimmed;
};

const CourseItem: React.FC<{ item: Course | CourseText, index: number }> = ({ item, index }) => {
    if (item.type === 'text') {
        return null;
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

    cleanedTitle = normalizeDisplayTitle(courseId, cleanedTitle);

    return (
        <div className="h-full w-full rounded-lg border border-gray-200 bg-white px-3 py-3 my-1.5">
            <div className="flex justify-between gap-3 min-h-[58px]">
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                    {courseId && (
                        <div className="font-sans text-[11px] font-black tracking-wider text-primary-700 uppercase mb-1">
                            {courseId}
                        </div>
                    )}
                    <div className="text-[14px] font-semibold text-gray-900 leading-snug whitespace-normal">
                        {cleanedTitle}
                    </div>
                </div>

                {item.credits && (
                    <div className="shrink-0 flex items-center">
                        <div className="flex flex-col items-center justify-center min-w-[64px] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <span className="text-[14px] font-black tabular-nums text-gray-800 leading-none">
                                {item.credits.replace(/[a-z]/gi, '').trim()}
                            </span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                                Credits
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ name: string, credits: string | null, depth: number }> = ({ name, credits, depth }) => {
    if (depth === 0) {
        return (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 mt-7 first:mt-2">
                <h3 className="font-sans text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
                    {name}
                </h3>
                {credits && (
                    <div className="shrink-0 inline-flex items-center justify-center px-2 py-1 rounded-md border bg-amber-50 text-amber-900 border-amber-200">
                        <span className="text-[10px] font-bold uppercase tracking-wide tabular-nums">
                            Choose {credits} Credits
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 mt-5 first:mt-2">
            <h4 className="font-sans text-[12px] sm:text-[13px] font-black text-gray-800 uppercase tracking-wider">
                {name}
            </h4>

            {credits && (
                <div className="shrink-0 inline-flex items-center justify-center px-2 py-1 rounded-md border bg-amber-50 text-amber-900 border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wide tabular-nums">
                        Complete {credits} Credits
                    </span>
                </div>
            )}

            <div className="h-px flex-1 bg-gray-200 min-w-[24px]" />
        </div>
    );
};

const shouldHideGroupName = (name: string, depth: number) => {
    const normalized = name.toLowerCase().trim();
    if (!normalized) return true;

    // Always hide generic wrappers.
    if (normalized === 'program requirements' || normalized === 'required courses') return true;

    // Top-level "<Program> Requirements" is redundant with page title.
    if (depth === 0 && /requirements$/.test(normalized)) return true;

    return false;
};

const collectDescendantCourseIds = (groups: CourseGroup[] = [], acc = new Set<string>()) => {
    for (const group of groups) {
        const items = Array.isArray(group.items) ? group.items : [];
        for (const item of items) {
            if (item.type === 'course' && item.course_id) {
                acc.add(item.course_id.trim().toUpperCase());
            }
        }
        if (group.subgroups && group.subgroups.length > 0) {
            collectDescendantCourseIds(group.subgroups, acc);
        }
    }
    return acc;
};

const RecursiveSection: React.FC<{ group: CourseGroup; depth: number }> = ({ group, depth }) => {
    const cleanedName = cleanText(group.group_name);
    const creditsFromHeader = extractCredits(group.group_name);
    const items = Array.isArray(group.items) ? group.items : [];
    const displayCredits = group.credits_required || creditsFromHeader;
    const hasSubgroups = !!(group.subgroups && group.subgroups.length > 0);

    // Many WSU sections contain a flattened parent list plus structured subgroups.
    // Prefer subgroup structure and suppress duplicated parent course rows.
    const descendantCourseIds = hasSubgroups ? collectDescendantCourseIds(group.subgroups || []) : new Set<string>();
    const displayItems = hasSubgroups
        ? items.filter(item => item.type === 'text' || (item.type === 'course' && !descendantCourseIds.has((item.course_id || '').trim().toUpperCase())))
        : items;
    const courseItems = displayItems.filter(item => item.type === 'course') as Course[];
    const textItems = displayItems
        .filter(item => item.type === 'text')
        .map(item => cleanText((item as CourseText).content))
        .filter(Boolean);

    if (!cleanedName && displayItems.length === 0 && !hasSubgroups) return null;

    return (
        <div className={`${depth === 0 ? 'mb-8' : 'mb-4'}`}>

            {cleanedName && !shouldHideGroupName(cleanedName, depth) && (
                <div className="relative">
                    <SectionHeader name={cleanedName} credits={displayCredits} depth={depth} />
                </div>
            )}

            {(() => {
                const rawGroupNotes = (group.notes || [])
                    .map(note => cleanText(note))
                    .filter(Boolean);
                const noteLines = [...textItems, ...rawGroupNotes];
                const uniqueNotes = Array.from(new Set(noteLines));
                if (uniqueNotes.length === 0) return null;

                return (
                    <div className="my-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-900">
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Info size={14} />
                            </div>
                            <div className="space-y-1">
                                {uniqueNotes.map((note, idx) => (
                                    <p key={idx} className="text-[13px] leading-relaxed">
                                        {note}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {courseItems.length > 0 && (
                <div className="space-y-1.5 mb-2">
                    {courseItems.map((item, idx) => (
                        <div key={idx}>
                            <CourseItem item={item} index={idx} />
                        </div>
                    ))}
                </div>
            )}

            {hasSubgroups && (
                <div className="mt-4 pl-3 border-l border-gray-200 space-y-2">
                    {(group.subgroups || []).map((sub, idx) => (
                        <RecursiveSection key={idx} group={sub} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseRequirementWidget: React.FC<{ courseStructure: CourseGroup[] }> = ({ courseStructure }) => {
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

