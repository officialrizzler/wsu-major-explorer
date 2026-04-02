
import React, { useState, useEffect } from 'react';
import { useCompare } from '../contexts/CompareContext';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Program } from '../types';
import { Plus, X, Share2, Check, Sparkles, Bot } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import DynamicBackground from '../components/DynamicBackground';
import AddProgramModal from '../components/AddProgramModal';
import ReactMarkdown from 'react-markdown';
import { getCompareInsights } from '../services/advisorService';

const collegeColorHexMap: Record<string, string> = {
    'College of Business': '#06b6d4',
    'College of Education': '#f59e0b',
    'College of Liberal Arts': '#6366f1',
    'College of Nursing and Health Sciences': '#f43f5e',
    'College of Science and Engineering': '#10b981',
    'Pre-Professional Pathways': '#64748b',
};

const ComparePage: React.FC = () => {
    const { compareList, removeFromCompare, setCompareList } = useCompare();
    const { programs, departments, loading } = useData();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [isSharedView, setIsSharedView] = useState(false);
    const [aiComparison, setAiComparison] = useState<string | null>(null);
    const [isGeneratingComparison, setIsGeneratingComparison] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const location = useLocation();


    useEffect(() => {
        if (loading) return;

        const leftId = searchParams.get('left');
        const rightId = searchParams.get('right');
        const p3Id = searchParams.get('p3');
        const p4Id = searchParams.get('p4');

        if (leftId || rightId || p3Id || p4Id) {
            setIsSharedView(true);
            const ids = [leftId, rightId, p3Id, p4Id].filter(Boolean) as string[];
            const matchedPrograms = ids
                .map(id => programs.find(p => p.program_id === id))
                .filter(Boolean) as Program[];

            if (matchedPrograms.length > 0) {

                const currentIds = compareList.map(p => p.program_id).join(',');
                const newIds = matchedPrograms.map(p => p.program_id).join(',');
                if (currentIds !== newIds) {
                    setCompareList(matchedPrograms);
                }
            }
        }
    }, [loading, programs, searchParams, setCompareList, compareList]);


    useEffect(() => {
        if (compareList.length > 0) {
            const names = compareList.map(p => p.program_name).join(' vs ');
            document.title = `${names} | WSU Explorer`;

            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', `Compare ${compareList.map(p => p.program_name).join(' and ')} majors by outcomes, coursework, and career paths.`);
            }
        } else {
            document.title = 'Compare Programs | WSU Explorer';
        }
        
        // Reset AI comparison when programs change
        setAiComparison(null);
        setAiError(null);
    }, [compareList]);

    const handleShare = () => {
        const params = new URLSearchParams();
        if (compareList[0]) params.set('left', compareList[0].program_id);
        if (compareList[1]) params.set('right', compareList[1].program_id);
        if (compareList[2]) params.set('p3', compareList[2].program_id);
        if (compareList[3]) params.set('p4', compareList[3].program_id);


        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

        navigator.clipboard.writeText(url).then(() => {
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
        });
    };

    const totalDepartments = departments.filter(d => d.total_enrollment_fall_2021 != null).length;

    const metrics = [
        { label: "College", getValue: (p: Program) => p.department?.college_name, isNumeric: false },
        { label: "Department", getValue: (p: Program) => p.department?.department_name, isNumeric: false },
        { label: "Department Enrollment & Rank", getValue: (p: Program) => p.department?.total_enrollment_fall_2021 ? `${p.department.total_enrollment_fall_2021} (Rank ${p.department.rank} of ${totalDepartments})` : 'N/A', isNumeric: false },
        { label: "Degree Type", getValue: (p: Program) => p.expanded_degree_type, isNumeric: false },
        { label: "Credential Level", getValue: (p: Program) => p.credential_level, isNumeric: false },
        { label: "Program Credits (25-26)", getValue: (p: Program) => p.program_credits, higherIsBetter: false, isNumeric: false },
        { label: "Total Credits", getValue: (p: Program) => p.total_credits, higherIsBetter: false, isNumeric: true },
        { label: "Enrollment (Fall 2021)", getValue: (p: Program) => p.enrollment_fall_2021, higherIsBetter: true, isNumeric: true },
        { label: "Graduates (FY 2021)", getValue: (p: Program) => p.graduates_total, higherIsBetter: true, isNumeric: true },
        { label: "Median Salary (MN 24-25)", getValue: (p: Program) => p.career_outcomes && p.career_outcomes.length > 0 ? p.career_outcomes[0].median_salary_mn : null, higherIsBetter: true, isCurrency: true, isNumeric: true },
    ];

    const getBestValue = (metric: any) => {
        if (metric.higherIsBetter === undefined) return null;
        const numericValues = compareList.map(p => metric.getValue(p)).filter(v => typeof v === 'number') as number[];
        if (numericValues.length < 2) return null;
        return metric.higherIsBetter ? Math.max(...numericValues) : Math.min(...numericValues);
    };

    const handleGenerateAIComparison = async () => {
        setIsGeneratingComparison(true);
        setAiError(null);
        try {
            const insights = await getCompareInsights(compareList);
            setAiComparison(insights);
        } catch (error: any) {
            setAiError(error.message || "Failed to generate comparison. Please try again.");
        } finally {
            setIsGeneratingComparison(false);
        }
    };

    const renderEmptyState = () => (
        <DynamicBackground className="flex-grow flex flex-col">
            <div className="flex-grow flex items-center justify-center py-40">
                <div className="text-center container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 animate-fade-in-up">Compare Programs</h1>
                    <p className="mt-4 text-gray-600 font-body">You haven't selected any programs to compare yet.</p>
                    <button onClick={() => setAddModalOpen(true)} className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-semibold transition font-body shadow-lg shadow-primary-500/30">
                        <Plus size={18} /> Add Programs to Compare
                    </button>
                </div>
            </div>
        </DynamicBackground>
    );

    const renderTableView = () => (
        <DynamicBackground className="flex-grow">
            <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative`}>
                <div className="text-center mb-12">
                    {isSharedView && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-4 animate-fade-in">
                            Shared Comparison
                        </div>
                    )}
                    <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight animate-fade-in-up">
                        {compareList.length > 1
                            ? compareList.map(p => p.program_name).join(' vs ')
                            : 'Program Comparison'}
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-gray-600 font-body">A side-by-side look at your selected programs.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white px-2 sm:px-4 rounded-t-xl">
                        <div className="flex gap-2">
                            {compareList.length < 4 && (
                                <button onClick={() => setAddModalOpen(true)} className="font-body flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border border-primary-200 text-xs sm:text-sm font-semibold rounded-md text-primary-700 hover:bg-primary-50">
                                    <Plus size={16} /> Add Program
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleShare}
                            className="font-body flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 text-xs sm:text-sm font-semibold rounded-md text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                        >
                            <Share2 size={16} /> Share Comparison
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-b-xl">
                        <table className="w-full min-w-[860px] border-separate border-spacing-0 table-auto">
                            <tbody>
                                { }
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <td className="sticky left-0 min-w-[180px] w-[180px] sm:min-w-[220px] sm:w-[220px] md:min-w-[250px] md:w-[250px] p-2 sm:p-4 font-semibold text-gray-900 font-body bg-white z-20 border-r border-b border-gray-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                        <span className="text-sm sm:text-base">Programs</span>
                                    </td>
                                    {compareList.map(p => (
                                        <td
                                            key={`programs-${p.program_id}`}
                                            className="min-w-[220px] p-3 bg-white align-top border-b border-gray-200"
                                        >
                                            <div
                                                className="relative h-full min-h-[56px] pl-3 pr-9 py-2 rounded-md bg-gray-100/50 flex flex-col justify-center border border-gray-100"
                                                style={{
                                                    borderLeft: `4px solid ${collegeColorHexMap[p.department?.college_name || ''] || '#4b5563'}`
                                                }}
                                            >
                                                <p className="text-gray-900 text-sm sm:text-base font-semibold leading-snug break-words pr-2">
                                                    {p.program_name}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCompare(p.program_id)}
                                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                                                    aria-label={`Remove ${p.program_name}`}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                { }
                                {metrics.map((metric) => {
                                    const bestValue = getBestValue(metric);

                                    return (
                                        <tr key={metric.label} className="group">
                                            <td className="sticky left-0 min-w-[180px] w-[180px] sm:min-w-[220px] sm:w-[220px] md:min-w-[250px] md:w-[250px] p-2 sm:p-4 font-semibold text-gray-700 font-body bg-white z-20 border-b border-gray-200 border-r border-gray-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] transition-colors hover:bg-gray-50">
                                                <span className="text-xs sm:text-sm">{metric.label}</span>
                                            </td>
                                            {compareList.map(p => {
                                                const value = metric.getValue(p);
                                                const isBest = value === bestValue && bestValue !== null && typeof value === 'number';
                                                const displayValue = value === null || value === undefined
                                                    ? <span className="text-gray-500 italic">N/A</span>
                                                    : metric.isCurrency ? `$${Number(value).toLocaleString()}` : String(value);

                                                const alignClass = metric.isNumeric ? 'text-center' : 'text-left';

                                                return (
                                                    <td key={p.program_id} className={`min-w-[220px] p-2 sm:p-4 text-xs sm:text-sm font-body align-middle bg-white border-b border-gray-200 break-words ${alignClass} ${isBest ? 'text-green-600 font-bold' : 'text-gray-700'} transition-colors hover:bg-gray-50`}>
                                                        {displayValue}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {compareList.length > 1 && !aiComparison && !aiError && (
                    <div className="mt-8 flex items-center justify-center">
                        <button
                            onClick={handleGenerateAIComparison}
                            disabled={isGeneratingComparison}
                            className="font-body inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 disabled:opacity-70 w-full sm:w-auto justify-center"
                        >
                            {isGeneratingComparison ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Sparkles size={20} />}
                            {isGeneratingComparison ? "Generating Insights..." : "AI Comparison Summary"}
                        </button>
                    </div>
                )}

                {(aiComparison || aiError) && (
                    <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 flex items-center gap-3">
                            <Bot className="text-white" size={24} />
                            <h3 className="text-white font-semibold text-lg">AI Comparison Insights</h3>
                        </div>
                        <div className="p-6 md:p-8 bg-white text-gray-800">
                            {aiError ? (
                                <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-100">
                                    <p>{aiError}</p>
                                </div>
                            ) : (
                                <div className="text-sm md:text-base leading-relaxed font-body">
                                    <ReactMarkdown
                                        components={{
                                            a: ({node, ...props}) => <a {...props} className="text-indigo-600 hover:text-indigo-800 underline font-medium" target="_blank" rel="noopener noreferrer" />,
                                            p: ({node, ...props}) => <p {...props} className="mb-4 last:mb-0" />,
                                            ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 mb-4 space-y-2" />,
                                            ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 mb-4 space-y-2" />,
                                            li: ({node, ...props}) => <li {...props} />,
                                            strong: ({node, ...props}) => <strong {...props} className="font-semibold text-gray-900" />,
                                            h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-gray-900" />,
                                            h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold mb-3 mt-5 first:mt-0 text-gray-900" />,
                                            h3: ({node, ...props}) => <h3 {...props} className="text-lg font-bold mb-2 mt-4 first:mt-0 text-gray-900" />,
                                        }}
                                    >
                                        {aiComparison || ""}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DynamicBackground>
    );

    return (
        <>
            {compareList.length === 0 ? renderEmptyState() : renderTableView()}
            {isAddModalOpen && <AddProgramModal onClose={() => setAddModalOpen(false)} />}

            { }
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 pointer-events-none ${showCopyToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                    </div>
                    <span className="font-body text-sm font-medium">Link copied — anyone with it can view this comparison</span>
                </div>
            </div>
        </>
    );
};

export default ComparePage;
