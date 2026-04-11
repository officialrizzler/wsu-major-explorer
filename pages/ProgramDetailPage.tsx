import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, ExternalLink, Scale, CheckCircle, XCircle, Briefcase, Handshake, Building, MapPin, BookOpen, TrendingUp, TrendingDown, Minus, Users, ChevronDown, Calendar } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';

import { CareerOutcome } from '../types';
import CourseRequirementWidget from '../components/CourseRequirementWidget';
import ProfessorWidget from '../components/ProfessorWidget';
import professorsData from '../data/professors_data.json';
import { buildProgramFitTraits } from '../utils/programFit';


const Widget: React.FC<{ title: string, icon?: React.ReactNode, children: React.ReactNode, year?: string, badges?: React.ReactNode }> = ({ title, icon, children, year, badges }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="px-6 pt-6 sm:px-8 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center text-gray-900 tracking-tight">
                        <span className="flex items-center gap-3">{icon} {title}</span>
                        {year && <span className="ml-3 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 uppercase tracking-widest">{year}</span>}
                    </h2>
                    {badges}
                </div>
            </div>

            <div className="p-6 sm:p-8 pt-6 sm:pt-6">
                {children}
            </div>
        </div>
    );
};

const CareerIntelligenceExplorer: React.FC<{ program: any }> = ({ program }) => {
    const isMinor = program.credential_level === 'Minor' || program.degree_type === 'Minor' || program.degree_type === 'Certificate' || program.degree_type === 'Certificicate';
    const outcomes = program.career_outcomes || [];

    if (!outcomes.length) return null;

    if (isMinor) {
        return (
            <Widget title="Career Pairings" icon={<Briefcase size={24} className="text-blue-400" />}>
                <p className="text-sm text-gray-500 mb-6 font-body">Adding this minor provides specific skills that enhance your primary major and open up roles across these fields:</p>
                <div className="space-y-4">
                    {outcomes.map((outcome: any) => (
                        <div key={outcome.occupation_code} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{outcome.occupation_title}</h4>
                            {outcome.context && (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mr-1 mt-1">Key Skills:</span>
                                        {outcome.context.technical_skills.map((skill: string) => (
                                            <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Widget>
        );
    }

    return (
        <Widget title="Career Outlook" icon={<Briefcase size={24} className="text-blue-400" />}>
            <div className="space-y-8">
                {outcomes.map((outcome: any, index: number) => (
                    <div key={outcome.occupation_code} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-4 flex justify-between items-start gap-4">
                                    <span className="leading-snug">{outcome.occupation_title}</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase shrink-0">MN DEED</span>
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        {(() => {
                                            const baseSalary = outcome.median_salary_mn || (outcome.median_wage_mn ? Math.round(outcome.median_wage_mn * 2080 / 1000) * 1000 : null);
                                            return (
                                                <>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Median Salary (MN)</p>
                                                        <div className="flex items-end gap-2">
                                                            <p className="text-2xl font-black text-emerald-600 leading-none">${baseSalary ? baseSalary.toLocaleString() : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">10-Yr Growth</p>
                                                        <p className="text-sm font-black text-gray-800 leading-none mt-1">{outcome.growth_rate_10yr_mn ?? 'N/A'}</p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    
                                    {/* Visual Bar */}
                                    {(() => {
                                        const baseSalary = outcome.median_salary_mn || (outcome.median_wage_mn ? Math.round(outcome.median_wage_mn * 2080 / 1000) * 1000 : null);
                                        if (!baseSalary) return null;
                                        
                                        const hasExplicitBounds = outcome.wage_10th_mn && outcome.wage_90th_mn;
                                        
                                        const parseBound = (boundVal: number) => {
                                            return boundVal < 500 ? Math.round(boundVal * 2080 / 1000) * 1000 : Math.round(boundVal / 1000) * 1000;
                                        };
                                        
                                        const lowRange = hasExplicitBounds ? parseBound(outcome.wage_10th_mn!) : Math.round(baseSalary * 0.65 / 1000) * 1000;
                                        const highRange = hasExplicitBounds ? parseBound(outcome.wage_90th_mn!) : Math.round(baseSalary * 1.5 / 1000) * 1000;

                                        return (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] text-gray-500 font-body mb-2 flex justify-between">
                                                    <span>Entry / Low Range</span>
                                                    <span>Experienced / High</span>
                                                </p>
                                                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className="absolute top-0 bottom-0 left-[15%] right-[15%] bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-300 opacity-30 rounded-full"
                                                    ></div>
                                                    <div 
                                                        className="absolute top-0 bottom-0 left-[50%] w-1.5 bg-emerald-600 rounded-full shadow border border-white z-10"
                                                        style={{ transform: 'translateX(-50%)' }}
                                                    ></div>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-body mt-2 flex justify-between font-semibold">
                                                    <span>${lowRange.toLocaleString()}</span>
                                                    <span className="text-emerald-700">${baseSalary.toLocaleString()}</span>
                                                    <span>${highRange.toLocaleString()}</span>
                                                </p>
                                            </div>
                                        );
                                    })()}

                                    <a href={outcome.occupation_data_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-primary-600 hover:text-primary-500 transition-colors uppercase tracking-wider">
                                        View Full DEED Data <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                            
                            {outcome.context && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">Technical Skills You'll Need</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {outcome.context.technical_skills.map((skill: string) => (
                                                <span key={skill} className="px-2.5 py-1 bg-white text-gray-800 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">Human Skills To Master</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {outcome.context.human_skills.map((skill: string) => (
                                                <span key={skill} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-md border border-primary-100">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {outcome.context && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> The Day-to-Day</h4>
                                    <ul className="space-y-2 mb-4">
                                        {outcome.context.top_tasks.map((task: string) => (
                                            <li key={task} className="flex items-start gap-2 text-sm text-gray-600 font-body">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                    {index === outcomes.length - 1 && Array.isArray(program.related_job_titles) && program.related_job_titles.length > 0 && (
                                        <div className="pt-3 mt-3 border-t border-gray-100/60">
                                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Other Common Roles</h4>
                                            <p className="text-xs text-gray-500 font-body">
                                                {program.related_job_titles.slice(0, 4).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex flex-col justify-start self-start">
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={14} /> Regional Employers</h4>
                                    <p className="text-xs text-amber-700 font-body mb-3 leading-relaxed">Graduates in this field often find opportunities with these employers in southeast Minnesota:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {outcome.context.regional_employers.map((employer: string) => (
                                            <span key={employer} className="px-2 py-0.5 bg-white text-amber-800 text-xs font-bold rounded shadow-sm flex items-center gap-1"><Building size={10} className="opacity-50"/> {employer}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Widget>
    );
};

const TrendIcon = ({ trend }: { trend: 'Up' | 'Down' | 'Stable' | null | undefined }) => {
    if (trend === 'Up') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'Down') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-gray-500" />;
};

const SnapshotRow: React.FC<{ label: string, value: string | number, trend?: 'Up' | 'Down' | 'Stable' | null }> = ({ label, value, trend }) => (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0 font-body">
        <dt className="text-gray-500 text-xs">{label}</dt>
        <dd className="font-bold flex items-center gap-1 text-gray-900 text-xs text-right ml-4">
            {trend && <TrendIcon trend={trend} />} {value}
        </dd>
    </div>
);

const formatTrait = (raw: string) => {
    const cleaned = (raw || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return '';
    const sentence = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const ProgramDetailPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const { getProgramById, departments } = useData();
    const { addToCompare, removeFromCompare, isComparing } = useCompare();

    const program = getProgramById(programId);


    const siteUrl = "https://explorewsu.com";
    const canonicalUrl = program ? `${siteUrl}/program/${program.program_id}` : siteUrl;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Explore Majors",
                "item": `${siteUrl}/explore`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": program?.program_name,
                "item": canonicalUrl
            }
        ]
    };

    const jsonLd = program ? {
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram",
        "name": program.program_name,
        "description": program.overview,
        "educationalCredentialAwarded": program.degree_type,
        "provider": {
            "@type": "CollegeOrUniversity",
            "name": "Winona State University",
            "url": "https://www.winona.edu"
        },
        "url": canonicalUrl
    } : null;

    if (!program) {
        return <div className="text-center py-20 font-body text-white">Program not found.</div>;
    }

    const generatedFitTraits = buildProgramFitTraits(program);
    const fitTraits = {
        you_might_like: Array.isArray(program.you_might_like) && program.you_might_like.length > 0 ? program.you_might_like : generatedFitTraits.you_might_like,
        not_for_you: Array.isArray(program.not_for_you) && program.not_for_you.length > 0 ? program.not_for_you : generatedFitTraits.not_for_you,
    };
    const isAddedToCompare = isComparing(program.program_id);
    const totalDepartments = departments.filter(d => d.total_enrollment_fall_2021 != null).length;

    const handleCompareToggle = () => {
        if (isAddedToCompare) {
            removeFromCompare(program.program_id);
        } else {
            if (!addToCompare(program)) {
                alert("You can compare a maximum of 4 programs.");
            }
        }
    };

    const getCollegeGradient = (collegeName: string | undefined) => {
        switch (collegeName) {
            case 'College of Business': return 'bg-gradient-to-br from-cyan-800 to-blue-900';
            case 'College of Education': return 'bg-gradient-to-br from-amber-700 to-orange-900';
            case 'College of Liberal Arts': return 'bg-gradient-to-br from-indigo-800 to-purple-900';
            case 'College of Nursing and Health Sciences': return 'bg-gradient-to-br from-rose-800 to-pink-900';
            case 'College of Science and Engineering': return 'bg-gradient-to-br from-emerald-800 to-teal-900';
            case 'Pre-Professional Pathways': return 'bg-gradient-to-br from-slate-700 to-gray-800';
            default: return 'bg-gradient-to-br from-gray-800 to-gray-900';
        }
    };

    const headerGradientClass = getCollegeGradient(program.department?.college_name);

    return (
        <div className="bg-[#f5f5f7] min-h-screen">
            <Helmet>
                <title>{`${program.program_name} - Winona State Degree & Careers | WSU Explorer`}</title>
                <meta name="description" content={program.overview ? program.overview.substring(0, 160).trim() + '...' : `Become a ${program.program_name} expert at Winona State. View required courses, MN salary rankings, and local career opportunities.`} />
                <link rel="canonical" href={canonicalUrl} />
                
                {/* Social Meta Tags */}
                <meta property="og:title" content={`${program.program_name} | Winona State University`} />
                <meta property="og:description" content={`Explore coursework, salaries, and top employers for the ${program.program_name} program at Winona State.`} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbLd)}
                </script>
            </Helmet>
            <div className={`pt-10 pb-20 border-b border-gray-200 shadow-md ${headerGradientClass}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <Link to="/explore" className="flex items-center gap-2 text-xs text-primary-200 hover:text-white mb-6 font-bold font-body uppercase tracking-widest transition-colors">
                        <ArrowLeft size={14} /> Back to Explore
                    </Link>

                    <div className="relative z-10 p-6 sm:p-8 -mx-4 sm:-mx-6 rounded-2xl bg-white border border-gray-100 shadow-xl">
                        <div className="flex flex-col gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-snug mb-3 tracking-tight break-words">{program.program_name}</h1>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                    <div className="text-primary-700 text-xs font-bold inline-block px-2.5 py-1 rounded-md font-body bg-primary-50 border border-primary-100 uppercase tracking-wide">
                                        {program.expanded_degree_type || program.degree_type}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 font-body">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                        {program.department?.department_name}
                                        <span className="text-gray-400 mx-1">•</span>
                                        {program.department?.college_name}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 font-body leading-relaxed text-sm sm:text-base border-t border-gray-100 pt-6">
                                {program.overview}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href={program.program_page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-500 transition-all font-body active:scale-[0.98] shadow-md shadow-primary-500/20">
                                    Official Catalog <ExternalLink size={16} />
                                </a>
                                <button
                                    onClick={handleCompareToggle}
                                    className={`font-body inline-flex items-center justify-center gap-2 px-6 py-2.5 border text-sm font-bold rounded-lg transition-all active:scale-[0.98] ${isAddedToCompare ? 'border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'}`}
                                >
                                    {isAddedToCompare ? <Minus size={16} /> : <Scale size={16} />}
                                    {isAddedToCompare ? 'Remove' : 'Compare'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        <Widget title="Program Fit">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-emerald-600 uppercase tracking-wider"><CheckCircle size={18} /> Choose this if:</h3>
                                    <ul className="space-y-3 font-body">
                                        {fitTraits.you_might_like.map(item => (
                                            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
                                                {formatTrait(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-rose-600 uppercase tracking-wider"><XCircle size={18} /> Avoid this if:</h3>
                                    <ul className="space-y-3 font-body">
                                        {fitTraits.not_for_you.map(item => (
                                            <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"></span>
                                                {formatTrait(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Widget>
                        {program.course_structure && (
                            <Widget 
                                title="Courses You'll Take" 
                                icon={<BookOpen size={24} className="text-purple-600" />} 
                                defaultOpen={false}
                                badges={
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold inline-flex items-center px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-200 text-gray-600 uppercase tracking-widest shadow-sm"><Calendar size={12} className="mr-1.5 opacity-60" /> {program.academic_year || '24-25'} CATALOG</span>
                                    </div>
                                }
                            >
                                <CourseRequirementWidget courseStructure={program.course_structure} />
                            </Widget>
                        )}

                        {Array.isArray(program.career_outcomes) && program.career_outcomes.length > 0 && (
                            <>
                                <CareerIntelligenceExplorer program={program} />
                            </>
                        )}

                    </div>

                    <div className="space-y-6 lg:sticky top-24 self-start">
                        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex justify-between items-center">
                                <span>Program Snapshot</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-tighter">IPAR (2021)</span>
                            </h3>
                            <dl className="space-y-1">
                                <SnapshotRow label="Est. Time" value="4 years" />
                                <SnapshotRow label="Program Credits" value={program.program_credits} />
                                {program.total_credits && <SnapshotRow label="Total Credits" value={program.total_credits} />}
                                {program.enrollment_fall_2021 !== null && program.enrollment_fall_2021 !== undefined && (
                                    <SnapshotRow label="Fall 2021 Enrollment" value={program.enrollment_fall_2021} trend={program.enrollment_trend} />
                                )}
                                {program.graduates_total !== null && program.graduates_total !== undefined && (
                                    <SnapshotRow label="Graduates (2021)" value={program.graduates_total} />
                                )}
                            </dl>
                        </div>

                        {program.department && (
                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex justify-between items-center">
                                    <span>Department Info</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-tighter">IPAR (2021)</span>
                                </h3>
                                <dl className="space-y-1">
                                    <SnapshotRow label="Name" value={program.department.department_name} />
                                    <SnapshotRow label="Enrollment" value={program.department.total_enrollment_fall_2021 ?? 'N/A'} />
                                    <SnapshotRow label="Size Rank" value={program.department.rank ? `Rank ${program.department.rank} of ${totalDepartments}` : 'N/A'} />
                                </dl>
                            </div>
                        )}
                        {program.department && (
                            <ProfessorWidget
                                departmentId={program.department.department_id}
                                professorsData={professorsData}
                            />
                        )}

                        {Array.isArray(program.recommended_minors) && program.recommended_minors.length > 0 && (
                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Minors pair well with</h3>
                                <div className="flex flex-wrap gap-2">
                                    {program.recommended_minors.map(minor => <span key={minor.id} className="font-body bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded border border-gray-200">{minor.name}</span>)}
                                </div>
                            </div>
                        )}

                        {Array.isArray(program.clubs) && program.clubs.length > 0 && (
                            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Related Clubs</h3>
                                <div className="space-y-2">
                                    {program.clubs.map(club => (
                                        <a href={club.club_url} target="_blank" rel="noopener noreferrer" key={club.club_id} className="group flex items-center justify-between font-body bg-gray-50 text-[11px] font-bold px-3 py-2 rounded border border-gray-200 hover:border-primary-500 transition-all">
                                            <span className="text-gray-700 truncate mr-2">{club.club_name}</span>
                                            <ExternalLink size={12} className="text-gray-400 group-hover:text-primary-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetailPage;
