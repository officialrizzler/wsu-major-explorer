import { Department, Program } from '../types';

type FitTraits = {
    choose: string[];
    avoid: string[];
};

type FitRule = {
    matchers: RegExp[];
    traits: FitTraits;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makeRegex = (keywords: string[]) => keywords.map(keyword => new RegExp(escapeRegExp(keyword), 'i'));

const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const rotatePick = (items: string[], seed: number, count = 3) => {
    if (items.length === 0) return [];
    const offset = seed % items.length;
    const rotated = [...items.slice(offset), ...items.slice(0, offset)];
    return rotated.slice(0, Math.min(count, rotated.length));
};

const normalizeSentence = (sentence: string) => {
    const cleaned = sentence.trim().replace(/\s+/g, ' ');
    if (!cleaned) return '';
    const withPeriod = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
    return withPeriod.charAt(0).toUpperCase() + withPeriod.slice(1);
};

const rules: FitRule[] = [
    {
        matchers: makeRegex(['accounting', 'audit', 'auditing', 'tax', 'cpa', 'financial reporting', 'bookkeeping', 'financial statements']),
        traits: {
            choose: [
                'You like working with financial records and exact details.',
                'You are comfortable with deadlines, rules, and clear standards.',
                'You enjoy catching small mistakes before they become bigger problems.',
                'You prefer practical decisions grounded in numbers.'
            ],
            avoid: [
                "You'd rather avoid open-ended creative work.",
                "You don't enjoy vague assignments with no clear deliverable.",
                'You prefer to avoid work that is mostly subjective.',
                "You'd rather avoid tasks that ignore numbers and accuracy."
            ]
        }
    },
    {
        matchers: makeRegex(['finance', 'investment', 'investments', 'portfolio', 'risk', 'banking', 'capital markets', 'financial markets']),
        traits: {
            choose: [
                'You enjoy markets, investments, and long-term planning.',
                'You like making decisions from financial data.',
                'You are comfortable tracking risk, return, and timing.',
                'You prefer work that connects money to strategy.'
            ],
            avoid: [
                "You'd rather avoid highly social service roles.",
                "You don't enjoy abstract theory without application.",
                'You prefer to avoid work that stays far from money or numbers.',
                "You'd rather avoid routine tasks with no analysis."
            ]
        }
    },
    {
        matchers: makeRegex(['economics', 'economic', 'markets', 'trade', 'incentive', 'policy analysis']),
        traits: {
            choose: [
                'You enjoy thinking about markets and incentives.',
                'You like explaining why people and organizations make choices.',
                'You are comfortable with theory that connects to real-world problems.',
                'You enjoy graphs, models, and cause-and-effect reasoning.'
            ],
            avoid: [
                "You'd rather avoid hands-on lab work.",
                "You don't enjoy highly repetitive tasks.",
                'You prefer to avoid work that never asks you to think broadly.',
                "You'd rather avoid purely routine production work."
            ]
        }
    },
    {
        matchers: makeRegex(['marketing', 'advertising', 'brand', 'consumer', 'promotion', 'sales', 'selling', 'public relations']),
        traits: {
            choose: [
                'You enjoy shaping messages for an audience.',
                'You like creative campaigns with measurable results.',
                'You are comfortable presenting ideas and persuading people.',
                'You prefer work that mixes creativity with deadlines.'
            ],
            avoid: [
                "You'd rather avoid detailed financial modeling.",
                "You don't enjoy highly technical lab-based work.",
                'You prefer to avoid purely back-room work with little communication.',
                "You'd rather avoid repetitive data entry."
            ]
        }
    },
    {
        matchers: makeRegex(['human resource', 'compensation', 'labor relations', 'talent', 'recruit', 'training and development', 'personnel']),
        traits: {
            choose: [
                'You enjoy working with people, policies, and workplace decisions.',
                'You like hiring, training, and supporting employees.',
                'You are comfortable handling confidential information.',
                'You enjoy solving people problems with structure and fairness.'
            ],
            avoid: [
                "You'd rather avoid abstract math-heavy work.",
                "You don't enjoy solitary lab research.",
                'You prefer to avoid work with very little human interaction.',
                "You'd rather avoid highly technical coding tasks."
            ]
        }
    },
    {
        matchers: makeRegex(['business administration', 'management', 'leadership', 'operations', 'organizational', 'entrepreneur', 'business management']),
        traits: {
            choose: [
                'You enjoy juggling multiple business functions at once.',
                'You like organizing projects and keeping teams aligned.',
                'You are comfortable making practical decisions across departments.',
                'You enjoy leadership and day-to-day operations.'
            ],
            avoid: [
                'You would rather avoid narrow technical specialization.',
                "You don't enjoy repetitive routine work.",
                'You prefer to avoid work that stays purely creative.',
                "You'd rather avoid isolated lab settings."
            ]
        }
    },
    {
        matchers: makeRegex(['business analysis', 'requirements', 'process', 'processes', 'systems analysis', 'business strategy']),
        traits: {
            choose: [
                'You enjoy mapping business processes and improving how work gets done.',
                'You like translating needs into clear requirements.',
                'You are comfortable using data to solve business problems.',
                'You enjoy connecting people, processes, and technology.'
            ],
            avoid: [
                "You'd rather avoid vague projects with no clear outcome.",
                "You don't enjoy work that stays purely theoretical.",
                'You prefer to avoid isolated lab research.',
                "You'd rather avoid jobs with no process improvement or problem solving."
            ]
        }
    },
    {
        matchers: makeRegex(['business law', 'legal studies', 'law', 'ethics', 'government', 'policy']),
        traits: {
            choose: [
                'You enjoy reading, writing, and building arguments.',
                'You like understanding rules, systems, and public decisions.',
                'You are comfortable with discussion and detailed analysis.',
                'You enjoy legal, policy, or government topics.'
            ],
            avoid: [
                "You'd rather avoid hands-on lab work.",
                "You don't enjoy pure number-crunching.",
                'You prefer to avoid work with very little reading or writing.',
                "You'd rather avoid repetitive technical routines."
            ]
        }
    },
    {
        matchers: makeRegex(['computer science', 'computer information systems', 'information systems', 'software', 'programming', 'coding', 'data science', 'bioinformatics', 'technology', 'network', 'database', 'web', 'geospatial', 'i-design', 'computer technology']),
        traits: {
            choose: [
                'You enjoy building systems and solving technical problems.',
                'You like debugging, coding, and working with data.',
                'You are comfortable learning new tools as technology changes.',
                'You enjoy making complex systems work reliably.'
            ],
            avoid: [
                "You'd rather avoid vague, unstructured requirements.",
                "You don't enjoy people-only roles with little technical problem solving.",
                'You prefer to avoid repetitive manual work.',
                "You'd rather avoid work that changes very little from day to day."
            ]
        }
    },
    {
        matchers: makeRegex(['engineering', 'composite materials', 'materials', 'pre-engineering', 'polymer', 'circuits', 'electronics']),
        traits: {
            choose: [
                'You enjoy designing and improving systems.',
                'You like math, physics, and hands-on problem solving.',
                'You are comfortable with precise work and clear specifications.',
                'You enjoy building things that have to work in the real world.'
            ],
            avoid: [
                "You'd rather avoid abstract theory without application.",
                "You don't enjoy open-ended creative writing.",
                'You prefer to avoid work that ignores math and measurement.',
                "You'd rather avoid pure desk work with no technical component."
            ]
        }
    },
    {
        matchers: makeRegex(['mathematics', 'statistics', 'actuarial', 'quantitative', 'data']),
        traits: {
            choose: [
                'You enjoy patterns, data, and quantitative reasoning.',
                'You like solving problems with logic and numbers.',
                'You are comfortable with abstract ideas that have clear rules.',
                'You enjoy finding answers in graphs, models, and evidence.'
            ],
            avoid: [
                "You'd rather avoid subjective or opinion-based work.",
                "You don't enjoy repeated writing-heavy assignments.",
                'You prefer to avoid highly unstructured projects.',
                "You'd rather avoid work with little to no numbers."
            ]
        }
    },
    {
        matchers: makeRegex(['biology', 'chemistry', 'physics', 'geoscience', 'environmental', 'biochemistry', 'ecology', 'laboratory', 'earth science', 'sustainability']),
        traits: {
            choose: [
                'You enjoy lab work and evidence-based problem solving.',
                'You like testing ideas and observing how systems behave.',
                'You are comfortable with precision, measurement, and procedure.',
                'You enjoy learning how the natural world works.'
            ],
            avoid: [
                "You'd rather avoid work with no clear method.",
                "You don't enjoy jobs that stay far from science and evidence.",
                'You prefer to avoid highly subjective assignments.',
                "You'd rather avoid too much public-facing persuasion work."
            ]
        }
    },
    {
        matchers: makeRegex(['nursing', 'medicine', 'medical', 'physician assistant', 'pharmacy', 'optometry', 'dentistry', 'podiatry', 'chiropractic', 'radiography', 'laboratory science', 'therapeutic']),
        traits: {
            choose: [
                'You enjoy direct patient care and clinical settings.',
                'You like helping people through detail-heavy work.',
                'You are comfortable with responsibility and fast-moving situations.',
                'You prefer learning how health systems support patient outcomes.'
            ],
            avoid: [
                "You'd rather avoid hands-on care.",
                "You don't enjoy stressful or emotional situations.",
                'You prefer to avoid squeamish or invasive tasks.',
                "You'd rather avoid work with little patient contact."
            ]
        }
    },
    {
        matchers: makeRegex(['public health', 'health administration', 'community health', 'epidemiology', 'nutrition']),
        traits: {
            choose: [
                'You enjoy improving health at the community level.',
                'You like prevention, education, and systems thinking.',
                'You are comfortable connecting policy, data, and people.',
                'You enjoy work that can improve population outcomes.'
            ],
            avoid: [
                "You'd rather avoid only one-on-one clinical care.",
                "You don't enjoy public-facing education or advocacy.",
                'You prefer to avoid health work with no policy or systems component.',
                "You'd rather avoid highly isolated technical research."
            ]
        }
    },
    {
        matchers: makeRegex(['exercise science', 'movement science', 'athletic training', 'physical education', 'strength and conditioning', 'therapeutic recreation', 'sport', 'coaching', 'recreation', 'athletic', 'adventure tourism', 'outdoor', 'sport leadership', 'sport management']),
        traits: {
            choose: [
                'You enjoy active, hands-on work with people.',
                'You like coaching, training, or guiding others.',
                'You are comfortable with movement, practice, and feedback.',
                'You enjoy helping people improve through physical activity.'
            ],
            avoid: [
                "You'd rather avoid desk-bound work.",
                "You don't enjoy low-movement or sedentary jobs.",
                'You prefer to avoid work with little direct human interaction.',
                "You'd rather avoid purely abstract theory."
            ]
        }
    },
    {
        matchers: makeRegex(['education', 'teaching', 'school counseling', 'reading instruction', 'special education', 'early childhood', 'child advocacy', 'literacy', 'curriculum', 'lesson', 'principal', 'superintendent', 'leadership education', 'instructional', 'bilingual']),
        traits: {
            choose: [
                'You enjoy helping students learn and grow.',
                'You like planning lessons and explaining ideas clearly.',
                'You are comfortable speaking in front of groups.',
                'You enjoy steady routines with people and structure.'
            ],
            avoid: [
                "You'd rather avoid quiet desk-only work.",
                "You don't enjoy repetition and classroom routines.",
                'You prefer to avoid work with little student interaction.',
                "You'd rather avoid roles that stay far from teaching or mentoring."
            ]
        }
    },
    {
        matchers: makeRegex(['art and design', 'design', 'music', 'theatre', 'film', 'mass communication', 'communication studies', 'creative writing', 'advertising', 'digital media', 'storytelling', 'journalism', 'performance']),
        traits: {
            choose: [
                'You enjoy creative expression and public presentation.',
                'You like storytelling, design, music, or performance.',
                'You are comfortable revising work through feedback.',
                'You enjoy turning ideas into something people can see or hear.'
            ],
            avoid: [
                "You'd rather avoid rigid routines.",
                "You don't enjoy repetitive data-heavy work.",
                'You prefer to avoid purely technical problem solving.',
                "You'd rather avoid work with little room for creativity."
            ]
        }
    },
    {
        matchers: makeRegex(['history', 'philosophy', 'psychology', 'sociology', 'criminal justice', 'ethnic studies', 'women', 'gender', 'conflict studies', 'social studies', 'global studies']),
        traits: {
            choose: [
                'You enjoy reading, writing, and discussion.',
                'You like understanding people, culture, and society.',
                'You are comfortable analyzing ideas from different angles.',
                'You enjoy connecting big questions to real situations.'
            ],
            avoid: [
                "You'd rather avoid lab-based technical work.",
                "You don't enjoy pure math or engineering-style problem solving.",
                'You prefer to avoid highly repetitive procedures.',
                "You'd rather avoid work with very little reading or writing."
            ]
        }
    },
    {
        matchers: makeRegex(['world languages', 'chinese', 'japanese', 'spanish', 'international', 'global studies', 'language']),
        traits: {
            choose: [
                'You enjoy language practice and cultural perspective.',
                'You like communication across different communities or countries.',
                'You are comfortable learning how people think in different contexts.',
                'You enjoy building fluency or working in international settings.'
            ],
            avoid: [
                "You'd rather avoid work that stays only inside one narrow field.",
                "You don't enjoy heavy technical or lab-based work.",
                'You prefer to avoid repetitive work with little communication.',
                "You'd rather avoid settings with no cultural or global connection."
            ]
        }
    },
    {
        matchers: makeRegex(['social work', 'human services', 'addiction counseling', 'counselor education', 'child advocacy', 'advocacy', 'mental health', 'counseling']),
        traits: {
            choose: [
                'You enjoy supporting people through difficult situations.',
                'You like advocacy, counseling, and direct human service work.',
                'You are comfortable with emotional conversations and empathy.',
                'You enjoy work that affects families and communities.'
            ],
            avoid: [
                "You'd rather avoid emotionally intense client work.",
                "You don't enjoy pure business or tech paths.",
                'You prefer to avoid isolated research with little human contact.',
                "You'd rather avoid work that keeps you far from helping people directly."
            ]
        }
    },
    {
        matchers: makeRegex(['individualized studies', 'i-design', 'liberal arts and sciences', 'interdisciplinary']),
        traits: {
            choose: [
                'You enjoy designing your own path across different interests.',
                'You like flexibility and connecting multiple fields.',
                'You are comfortable making your own choices and goals.',
                'You enjoy a program that can be tailored to what matters to you.'
            ],
            avoid: [
                "You'd rather avoid a very rigid program.",
                "You don't enjoy lack of flexibility or customization.",
                'You prefer to avoid following one narrow track end to end.',
                "You'd rather avoid a program with no room for individual direction."
            ]
        }
    }
];

const defaultTraits: FitTraits = {
    choose: [
        'You enjoy a mix of ideas, people, and practical work.',
        'You like learning through a program with clear goals.',
        'You are comfortable working through structured coursework.',
        'You enjoy a subject that gives you room to grow.'
    ],
    avoid: [
        "You'd rather avoid a very narrow track.",
        "You don't enjoy programs with little room to explore.",
        'You prefer to avoid work that feels disconnected from your interests.',
        "You'd rather avoid a path that feels too rigid."
    ]
};

const programText = (program: Program) =>
    [
        program.program_name,
        program.short_description,
        program.overview,
        ...(program.tags || [])
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const contextText = (program: Program, department?: Department) =>
    [
        department?.department_name,
        department?.college_name
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

const pickTraits = (primaryText: string, fallbackText: string) => {
    for (const rule of rules) {
        if (rule.matchers.some(matcher => matcher.test(primaryText))) {
            return rule.traits;
        }
    }
    for (const rule of rules) {
        if (rule.matchers.some(matcher => matcher.test(fallbackText))) {
            return rule.traits;
        }
    }
    return defaultTraits;
};

export const buildProgramFitTraits = (program: Program, department?: Department) => {
    const traits = pickTraits(programText(program), contextText(program, department));
    const seed = hashString(program.program_id);
    return {
        you_might_like: rotatePick(traits.choose, seed, 3).map(normalizeSentence),
        not_for_you: rotatePick(traits.avoid, seed + 1, 3).map(normalizeSentence)
    };
};
