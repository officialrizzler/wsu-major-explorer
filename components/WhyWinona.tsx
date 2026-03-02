import React, { useState, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import {
    User,
    Users,
    DollarSign,
    Heart,
    Search,
    ChevronRight,
    Building2,
    GraduationCap,
    TrendingUp,
    BookOpen,
    Briefcase,
    Award,
    ArrowRight,
    Calendar,
    ExternalLink,
    Minus,
    Plus,
    Equal
} from 'lucide-react';
import { Link } from 'react-router-dom';

/*
╔══════════════════════════════════════════════════════════════╗
║                  DATA MAPPING TABLE                          ║
╠════════════════════╦═══════════╦═══════════════════════════════╣
║ Metric             ║ Value     ║ Source / Year                 ║
╠════════════════════╬═══════════╬═══════════════════════════════╣
║ Total enrollment   ║ 5,637     ║ WSU Budget · FY2026 (FYE)     ║
║ Graduates          ║ 566       ║ WSU Budget · FY2026           ║
║ New Freshmen       ║ 1,357     ║ WSU Budget · FY2026 (+11.6%)  ║
║ Programs           ║ 200+      ║ WSU About · 2024              ║
║ Avg class size     ║ 24        ║ WSU About / CDS · latest      ║
║ Student-faculty    ║ 16:1      ║ WSU About / CDS · latest      ║
║ % classes <30      ║ 75%       ║ CDS · latest                  ║
║ NSSE Higher-Order  ║ 82%       ║ NSSE Snapshot 2021             ║
║ NSSE Natl Avg      ║ 74%       ║ NSSE Snapshot 2021             ║
║ NSSE Collab Learn  ║ 73%       ║ NSSE Snapshot 2021             ║
║ NSSE Eff. Writing  ║ 75%       ║ NSSE Snapshot 2021             ║
║ Retention rate     ║ 76.8%     ║ WSU About · 2024              ║
║ 6-yr grad rate     ║ 60.9%     ║ WSU About · 2024              ║
║ Continuing ed      ║ 14.6%     ║ WSU About · 2024              ║
║ Loan default rate  ║ 1.1%      ║ WSU About · 2024 (3-year)     ║
║ Bachelor's awards  ║ 1,336     ║ WSU About · 2022–2023         ║
║ Master's awards    ║ 177       ║ WSU About · 2022–2023         ║
║ Doctoral awards    ║ 66        ║ WSU About · 2022–2023         ║
║ % receiving FA 1yr ║ 97%       ║ WSU About · 2024              ║
║ % receiving FA all ║ 81%       ║ WSU About · 2024              ║
║ Avg inst. award    ║ $5,231    ║ WSU About · 2024              ║
║ Tuition & Fees     ║ $10,468   ║ WSU IPAR · 2024–2025          ║
║ Avg net price      ║ $13,712   ║ CDS 2022–2023 / IPEDS         ║
║ Student orgs       ║ 180+      ║ WSU Student Life               ║
║ Top employers      ║ (list)    ║ WSU About · 2024              ║
╚════════════════════╩═══════════╩═══════════════════════════════╝
*/

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const DATA = {
    scale: {
        total: 5637,
        graduates: 566,
        freshmanClass: 1357,
        programs: 200,
    },
    support: {
        ratio: 16,
        avgClassSize: 24,
        classesUnder30: 75,
    },
    experience: {
        higherOrderThinking: 82,
        nationalAvg: 74,
        collaborativeLearning: 73,
        effectiveWriting: 75,
    },
    outcomes: {
        associate: 37,
        bachelors: 1336,
        masters: 177,
        doctoral: 66,
        gradCertificates: 26,
        continuingEd: 14.6,
        topEmployers: ['Mayo Clinic', 'Fastenal', 'IBM', '3M', 'Target', 'Medtronic'],
    },
    cost: {
        tuition: 10498,
        booksAndSupplies: 900,
        housingAndFood: 9924,
        personalOther: 2640,
        totalExpenses: 23962,
        avgInstitutionalAward: 5673, // Derived: 23962 - 18289
        netPrice: 18289,
        aidFirstYear: 97, // Kept historical/institutional stat
        aidAllUndergrad: 81,
        loanDefaultRate: 1.1,
    },
    belonging: {
        retention: 76.8,
        gradRate: 60.9,
        studentOrgs: 180,
    },
};


// ─────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────
const Counter = ({
    from = 0,
    to,
    duration = 2,
    prefix = '',
    suffix = '',
    decimals = 0,
}: {
    from?: number;
    to: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    return (
        <motion.span
            ref={nodeRef}
            onViewportEnter={() => {
                if (hasAnimated || !nodeRef.current) return;
                setHasAnimated(true);
                const node = nodeRef.current;
                animate(from, to, {
                    duration,
                    onUpdate(value) {
                        if (decimals > 0) {
                            node.textContent = prefix + value.toFixed(decimals) + suffix;
                        } else {
                            node.textContent = prefix + Math.round(value).toLocaleString() + suffix;
                        }
                    },
                    ease: 'easeOut',
                });
            }}
            viewport={{ once: true, margin: '-10%' }}
        >
            {prefix}{from.toLocaleString()}{suffix}
        </motion.span>
    );
};


// ─────────────────────────────────────────────────────────
// Source Line
// ─────────────────────────────────────────────────────────
const SourceLine = ({ children, className = '' }: { children: string; className?: string }) => (
    <p className={`text-xs font-medium tracking-wide text-gray-400 mt-4 ${className}`}>
        {children}
    </p>
);


// ─────────────────────────────────────────────────────────
// Bridge Text
// ─────────────────────────────────────────────────────────
const BridgeText = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-24 px-6 text-center"
    >
        <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed italic">
            {children}
        </p>
    </motion.div>
);


// ─────────────────────────────────────────────────────────
// Eyebrow
// ─────────────────────────────────────────────────────────
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-[0.15em] uppercase mb-6 border border-primary-100">
        {children}
    </div>
);


// ─────────────────────────────────────────────────────────
// Narrative Section (side-by-side layout)
// ─────────────────────────────────────────────────────────
const NarrativeSection = ({
    children,
    visual,
    reverse = false,
    id,
}: {
    children: React.ReactNode;
    visual: React.ReactNode;
    reverse?: boolean;
    id?: string;
}) => (
    <section
        id={id}
        className="flex items-center justify-center px-6 md:px-12 lg:px-20 py-20 md:py-28"
    >
        <div
            className={`w-full max-w-7xl flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } items-center gap-12 lg:gap-20`}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12%' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex-1 w-full lg:max-w-xl"
            >
                {children}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12%' }}
                transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
                className="flex-1 w-full flex items-center justify-center"
            >
                {visual}
            </motion.div>
        </div>
    </section>
);


// ═══════════════════════════════════════════════════════════
//  SECTION VISUALIZATIONS
// ═══════════════════════════════════════════════════════════

// 1. SCALE
const ScaleVisual = () => (
    <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
                <div className="text-7xl md:text-8xl font-black text-primary-600 leading-none tracking-tighter">
                    <Counter to={DATA.scale.total} duration={2.5} />
                </div>
                <div className="text-base font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                    Students
                </div>
            </div>

            <div className="space-y-3">
                {[
                    { icon: GraduationCap, label: 'Graduate students', value: DATA.scale.graduates, color: 'bg-primary-50 text-primary-600' },
                    { icon: BookOpen, label: 'Programs offered', value: DATA.scale.programs, suffix: '+', color: 'bg-blue-50 text-blue-600' },
                    { icon: Users, label: 'New freshmen', value: DATA.scale.freshmanClass, color: 'bg-green-50 text-green-600' },
                ].map(({ icon: Ic, label, value, suffix, color }) => (
                    <div key={label} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${color}`}><Ic size={18} /></div>
                            <span className="font-medium text-gray-600 text-sm">{label}</span>
                        </div>
                        <span className="font-black text-gray-900 tabular-nums">
                            <Counter to={value} suffix={suffix} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


// 2. SUPPORT
const SupportVisual = () => (
    <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-6">
                <div className="text-6xl font-black text-primary-600 tracking-tight">
                    <Counter to={16} /><span className="text-gray-300 mx-0.5">:</span>1
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">
                    Student-to-Faculty Ratio
                </div>
            </div>

            {/* Icon Grid — 16 students + 1 professor */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 grid grid-cols-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                            className="aspect-square rounded-xl bg-primary-50 flex items-center justify-center"
                        >
                            <User size={18} className="text-primary-400" />
                        </motion.div>
                    ))}
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="shrink-0 w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30"
                >
                    <GraduationCap size={24} className="text-white" />
                </motion.div>
            </div>

            <div className="h-px bg-gray-100 my-5" />

            <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-black text-gray-900"><Counter to={24} /></div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Avg Class Size</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-black text-gray-900"><Counter to={75} suffix="%" /></div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Classes &lt;30</div>
                </div>
            </div>
        </div>
    </div>
);


// 3. EXPERIENCE (NSSE)
const ExperienceVisual = () => {
    const bars = [
        { label: 'Comparison Average', value: DATA.experience.nationalAvg, primary: false },
        { label: 'Winona State', value: DATA.experience.higherOrderThinking, primary: true },
    ];

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-primary-600" />
                    <span className="font-bold text-gray-600 text-sm uppercase tracking-wider">
                        Higher-Order Thinking
                    </span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                    Seniors reporting significant gains in analytical and critical thinking
                </p>

                {/* Horizontal Bar Chart */}
                <div className="space-y-5 mb-6">
                    {bars.map(({ label, value, primary }) => (
                        <div key={label}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-sm font-bold ${primary ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                                <span className={`text-lg font-black tabular-nums ${primary ? 'text-primary-600' : 'text-gray-400'}`}>
                                    <Counter to={value} suffix="%" />
                                </span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${value}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, delay: primary ? 0.3 : 0.1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${primary
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm'
                                        : 'bg-gray-300'
                                        }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delta Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100"
                >
                    <TrendingUp size={14} className="text-primary-600" />
                    <span className="text-sm font-bold text-primary-700">
                        +{DATA.experience.higherOrderThinking - DATA.experience.nationalAvg} points above comparison average
                    </span>
                </motion.div>

                {/* Additional Engagement */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-4 bg-green-50 rounded-2xl text-center border border-green-100">
                        <div className="text-2xl font-black text-green-700"><Counter to={75} suffix="%" /></div>
                        <div className="text-xs font-bold text-green-600 mt-1">Effective Writing</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-center border border-blue-100">
                        <div className="text-2xl font-black text-blue-700"><Counter to={73} suffix="%" /></div>
                        <div className="text-xs font-bold text-blue-600 mt-1">Collaborative Learning</div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// 4. OUTCOMES
const OutcomesVisual = () => {
    const total = DATA.outcomes.associate + DATA.outcomes.bachelors + DATA.outcomes.masters + DATA.outcomes.doctoral + DATA.outcomes.gradCertificates;
    return (
        <div className="w-full max-w-lg">
            {/* Degrees Awarded Breakdown */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Award size={18} className="text-primary-600" />
                    <span className="font-bold text-gray-600 text-sm uppercase tracking-wider">
                        Degrees Awarded
                    </span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Fall 2022 – Summer 2023</p>

                <div className="text-center mb-6">
                    <div className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
                        <Counter to={total} />
                    </div>
                    <div className="text-sm text-gray-500 font-medium mt-1">total degrees awarded</div>
                </div>

                {/* Stacked bar */}
                <div className="h-5 rounded-full overflow-hidden flex mb-4 shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(DATA.outcomes.associate / total * 100).toFixed(1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="bg-teal-400 h-full"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(DATA.outcomes.bachelors / total * 100).toFixed(1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="bg-primary-500 h-full"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(DATA.outcomes.masters / total * 100).toFixed(1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-primary-300 h-full"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(DATA.outcomes.doctoral / total * 100).toFixed(1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-purple-400 h-full"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(DATA.outcomes.gradCertificates / total * 100).toFixed(1)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="bg-amber-400 h-full"
                    />
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {[
                        { label: "Assoc.", value: DATA.outcomes.associate, color: 'bg-teal-400' },
                        { label: "Bachelor's", value: DATA.outcomes.bachelors, color: 'bg-primary-500' },
                        { label: "Master's", value: DATA.outcomes.masters, color: 'bg-primary-300' },
                        { label: 'Doctoral', value: DATA.outcomes.doctoral, color: 'bg-purple-400' },
                        { label: 'Grad Cert.', value: DATA.outcomes.gradCertificates, color: 'bg-amber-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                            <div className="flex items-center gap-1 justify-center mb-1">
                                <div className={`w-2 h-2 rounded-full ${color}`} />
                                <span className="text-[10px] font-bold text-gray-500">{label}</span>
                            </div>
                            <div className="text-base font-black text-gray-900 tabular-nums">
                                <Counter to={value} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                    <span className="text-sm text-blue-700 font-medium">
                        <span className="font-black">{DATA.outcomes.continuingEd}%</span> pursue continuing education after graduation
                    </span>
                </div>
            </div>

            {/* Top Employer Pipeline */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
                    Top employer pipelines
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {DATA.outcomes.topEmployers.map((emp, i) => (
                        <motion.div
                            key={emp}
                            initial={{ y: 12, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i, duration: 0.4 }}
                            className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
                        >
                            <Building2 size={16} className="text-gray-400 shrink-0" />
                            <span className="font-bold text-gray-700 text-sm">{emp}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// 5. COST & VALUE
const CostVisual = () => (
    <div className="w-full max-w-md">
        <div className="space-y-3">
            {/* Step 1: Tuition & Fees */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-xl"><BookOpen size={16} className="text-gray-400" /></div>
                    <div>
                        <span className="font-bold text-gray-700 text-sm">Tuition & Fees</span>
                        <div className="text-xs text-gray-400">In-state, per year</div>
                    </div>
                </div>
                <span className="font-black text-lg text-gray-800 tabular-nums">
                    $<Counter to={DATA.cost.tuition} />
                </span>
            </motion.div>

            {/* Plus */}
            <div className="flex justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                    <Plus size={14} className="text-gray-500" />
                </motion.div>
            </div>

            {/* Step 2: Books & Housing & Food */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl"><Building2 size={16} className="text-gray-400" /></div>
                        <div>
                            <span className="font-bold text-gray-700 text-sm">On-Campus Living</span>
                            <div className="text-[10px] text-gray-400">Housing & Food Avg.</div>
                        </div>
                    </div>
                    <span className="font-black text-base text-gray-800 tabular-nums">
                        $<Counter to={DATA.cost.housingAndFood} />
                    </span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-gray-500 font-medium">Books, Supplies & Personal</span>
                    <span className="font-bold text-sm text-gray-600 tabular-nums">
                        $<Counter to={DATA.cost.booksAndSupplies + DATA.cost.personalOther} />
                    </span>
                </div>
            </motion.div>

            {/* Minus */}
            <div className="flex justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                    <Minus size={14} className="text-green-600" />
                </motion.div>
            </div>

            {/* Step 3: Grants & Aid */}
            <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-green-50 p-5 rounded-2xl border border-green-100 flex justify-between items-center"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl"><DollarSign size={16} className="text-green-600" /></div>
                    <div>
                        <span className="font-bold text-green-700 text-sm">Grants & Aid</span>
                        <div className="text-xs text-green-500">Avg. institutional award for first-years</div>
                    </div>
                </div>
                <span className="font-black text-lg text-green-600 tabular-nums">
                    −$<Counter to={DATA.cost.avgInstitutionalAward} />
                </span>
            </motion.div>

            {/* Equals */}
            <div className="flex justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 }}
                    className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm"
                >
                    <Equal size={14} className="text-primary-600" />
                </motion.div>
            </div>

            {/* Step 4: Net Price */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 120 }}
                className="bg-gradient-to-br from-primary-600 to-primary-700 p-7 rounded-2xl shadow-xl shadow-primary-900/15 text-white relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-[0.15em] opacity-70 mb-1">
                        Average Net Price
                    </div>
                    <div className="text-4xl md:text-5xl font-black tracking-tight tabular-nums">
                        $<Counter from={DATA.cost.totalExpenses} to={DATA.cost.netPrice} duration={2.5} />
                    </div>
                    <div className="text-xs mt-2 opacity-60 font-medium">
                        Total expenses ($23,962) minus avg. grants/scholarship aid
                    </div>
                </div>
                <DollarSign size={120} className="absolute -bottom-4 -right-4 text-white/[0.06] rotate-12" />
            </motion.div>

            {/* Aid Stats */}
            <div className="grid grid-cols-2 gap-3 mt-2">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
                >
                    <div className="text-2xl font-black text-gray-900"><Counter to={97} suffix="%" /></div>
                    <div className="text-xs font-bold text-gray-400 mt-1 leading-tight">of first-years receive aid</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55 }}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
                >
                    <div className="text-2xl font-black text-gray-900"><Counter to={1.1} suffix="%" decimals={1} /></div>
                    <div className="text-xs font-bold text-gray-400 mt-1 leading-tight">3-year loan default rate</div>
                </motion.div>
            </div>
        </div>
    </div>
);


// 6. BELONGING
const BelongingVisual = () => (
    <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 space-y-5">
            <div className="text-center">
                <div className="text-6xl font-black text-primary-600 tracking-tighter leading-none">
                    <Counter to={DATA.belonging.retention} suffix="%" decimals={1} />
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mt-2">
                    First-Year Retention
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Students who return for their second year
                </p>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-900">
                        <Counter to={DATA.belonging.gradRate} suffix="%" decimals={1} />
                    </div>
                    <div className="text-xs font-bold text-gray-400 mt-1 leading-tight">6-Year Graduation Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-2xl font-black text-gray-900">
                        <Counter to={DATA.belonging.studentOrgs} suffix="+" />
                    </div>
                    <div className="text-xs font-bold text-gray-400 mt-1 leading-tight">Student Organizations</div>
                </div>
            </div>
        </div>
    </div>
);


// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const WhyWinona = () => {
    return (
        <div className="relative bg-gray-50">

            {/* ─── HERO ─── */}
            <div className="min-h-[70vh] flex items-center justify-center flex-col text-center p-6 bg-gradient-to-b from-white via-white to-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="max-w-5xl"
                >

                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.95] mb-6 lg:whitespace-nowrap">
                        Why{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                            Winona State?
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Discover what draws students to Winona — and what keeps them here.
                    </p>
                </motion.div>
            </div>


            {/* ─── 1. SCALE ─── */}
            <NarrativeSection id="why-scale" visual={<ScaleVisual />}>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    Big enough to explore.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    With <span className="text-primary-600 font-bold">5,637</span> students and{' '}
                    <span className="text-primary-600 font-bold">200+</span> programs across five colleges,
                    Winona State offers real breadth without the feeling of a mega-campus.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    Explore different interests, meet people across disciplines, and still be part of
                    a community where faces become familiar.
                </p>
                <SourceLine>WSU Budget Forum FY2026 · Full-Year Equivalent Enrollment</SourceLine>
            </NarrativeSection>




            {/* ─── 2. SUPPORT ─── */}
            <NarrativeSection id="why-support" visual={<SupportVisual />} reverse>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    Small enough for real attention.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    A <span className="text-primary-600 font-bold">16:1</span> student-to-faculty ratio and an average
                    class size of <span className="text-primary-600 font-bold">24</span> mean more direct interaction
                    with instructors — more feedback, more discussion, and stronger relationships
                    that support internships, references, and career planning.
                </p>
                <SourceLine>WSU About / Common Data Set · most recent available year</SourceLine>
            </NarrativeSection>




            {/* ─── 3. EXPERIENCE ─── */}
            <NarrativeSection id="why-experience" visual={<ExperienceVisual />}>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    Learning that shows up in outcomes.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    In student engagement results, WSU seniors report stronger gains in higher-order thinking than the comparison average.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    Students also report strong collaborative learning and writing-focused coursework —
                    the kind of practical skills employers and graduate programs look for.
                </p>
                <p className="text-xs text-gray-400 italic">
                    NSSE results are student-reported measures of learning experience.
                </p>
                <SourceLine>NSSE Snapshot 2021 · Winona State University</SourceLine>
            </NarrativeSection>




            {/* ─── 4. OUTCOMES ─── */}
            <NarrativeSection id="why-outcomes" visual={<OutcomesVisual />} reverse>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    Outcomes with real pathways.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    WSU graduates move into employment, graduate study, and professional programs, with established
                    employer pipelines in healthcare, business, engineering, and technology.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    Top regional employers include <span className="font-semibold text-gray-700">Mayo Clinic</span>,{' '}
                    <span className="font-semibold text-gray-700">Fastenal</span>,{' '}
                    <span className="font-semibold text-gray-700">IBM</span>,{' '}
                    <span className="font-semibold text-gray-700">3M</span>,{' '}
                    <span className="font-semibold text-gray-700">Target</span>, and{' '}
                    <span className="font-semibold text-gray-700">Medtronic</span> — connecting your degree to active
                    hiring networks in the Upper Midwest and beyond.
                </p>
                <SourceLine>WSU Employment Outcomes · Top Employer List · latest reporting year</SourceLine>
            </NarrativeSection>




            {/* ─── 5. COST & VALUE ─── */}
            <NarrativeSection id="why-cost" visual={<CostVisual />}>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    Transparent cost, real value.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    WSU has the <span className="text-primary-600 font-bold">lowest tuition rate</span> in the Minnesota State university system.
                    Start with the sticker price, then subtract grants and scholarships to see average net price.
                </p>
                <div className="my-5 p-4 bg-gray-100 rounded-xl">
                    <p className="text-sm font-bold text-gray-700 text-center tracking-wide">
                        Tuition & Fees + Room & Board − Grants/Aid = <span className="text-primary-600">Average Net Price</span>
                    </p>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    Most first-year students receive financial aid, and many graduates complete
                    with manageable debt — so you can plan with real numbers instead of guessing.
                </p>
                <SourceLine>IPEDS / National Center for Education Statistics (2023–2024)</SourceLine>
            </NarrativeSection>




            {/* ─── 6. BELONGING ─── */}
            <NarrativeSection id="why-belonging" visual={<BelongingVisual />} reverse>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
                    A place students stay.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium mb-4">
                    <span className="text-primary-600 font-bold">76.8%</span> of first-year students return for their
                    second year, and students can plug into <span className="text-primary-600 font-bold">180+</span> organizations
                    across interests and identities.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    A <span className="font-semibold text-gray-700">60.9%</span> six-year graduation rate reflects
                    sustained progress from first year to completion — students find community here,
                    and that connection keeps them going.
                </p>
                <SourceLine>WSU Retention & Graduation · Student Life</SourceLine>
            </NarrativeSection>


            {/* ─── FINAL CTA ─── */}
            <div className="py-20 md:py-32 px-6 bg-gradient-to-b from-gray-50 to-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-[0.95] mb-6">
                        Ready to take the next step?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                        The data speaks for itself. Now it's your move.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/explore"
                            className="group w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gray-900 px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                            <Search size={20} />
                            Explore Programs
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <a
                            href="https://www.winona.edu/admissions/visit/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                            <Calendar size={20} />
                            Schedule a Visit
                            <ExternalLink size={16} className="text-gray-400" />
                        </a>
                        <a
                            href="https://www.winona.edu/admissions/apply/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                            <ArrowRight size={20} />
                            Apply
                            <ExternalLink size={16} className="text-gray-400" />
                        </a>
                    </div>
                </motion.div>
            </div>

        </div>
    );
};

export default WhyWinona;
