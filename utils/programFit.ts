import { Program } from '../types';

export type FitTraits = {
  you_might_like: string[];
  not_for_you: string[];
};

const rawProgramFitTraits: Record<string, { choose: string[]; avoid: string[] }> = {
  "accounting-bs": {
    "choose": [
      "You enjoy financial records, reporting, and accuracy.",
      "You are comfortable with deadlines and clear rules.",
      "You want practical work that leads to clean answers."
    ],
    "avoid": [
      "You would rather avoid open-ended creative work.",
      "You would rather avoid tasks that ignore accuracy.",
      "You do not want work that feels vague or subjective."
    ]
  },
  "accounting-minor": {
    "choose": [
      "You enjoy accounting basics and financial literacy.",
      "You are comfortable with deadlines and clear rules.",
      "You want practical work that leads to clean answers."
    ],
    "avoid": [
      "You would rather avoid open-ended creative work.",
      "You would rather avoid tasks that ignore accuracy.",
      "You do not want work that feels vague or subjective."
    ]
  },
  "business-administration": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You like organizing projects and keeping teams aligned.",
      "You are comfortable making practical decisions across departments."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You prefer to avoid work that stays purely creative.",
      "You would rather avoid isolated technical settings."
    ]
  },
  "business-administration-minor": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You are comfortable making practical decisions across departments.",
      "You enjoy leadership and day-to-day operations."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You would rather avoid isolated technical settings.",
      "You do not enjoy repetitive routine work."
    ]
  },
  "business-analysis-minor": {
    "choose": [
      "You enjoy process improvement and clear requirements.",
      "You like translating needs into clear requirements.",
      "You are comfortable using data to solve business problems."
    ],
    "avoid": [
      "You would rather avoid vague projects with no clear outcome.",
      "You prefer to avoid isolated lab research.",
      "You would rather avoid jobs with no process improvement or problem solving."
    ]
  },
  "business-law-minor": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You are comfortable with discussion and detailed analysis.",
      "You enjoy reading, writing, and building arguments."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You would rather avoid repetitive technical routines.",
      "You do not enjoy pure number-crunching."
    ]
  },
  "business-management-minor": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You are comfortable making practical decisions across departments.",
      "You enjoy leadership and day-to-day operations."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You would rather avoid isolated technical settings.",
      "You do not enjoy repetitive routine work."
    ]
  },
  "economics": {
    "choose": [
      "You enjoy markets, incentives, and policy.",
      "You are comfortable with theory that connects to real-world problems.",
      "You enjoy graphs, models, and cause-and-effect reasoning."
    ],
    "avoid": [
      "You would rather avoid purely routine hands-on work.",
      "You would rather avoid purely routine production work.",
      "You do not enjoy highly repetitive tasks."
    ]
  },
  "economics-minor": {
    "choose": [
      "You enjoy markets, incentives, and policy.",
      "You like explaining why people and organizations make choices.",
      "You are comfortable with theory that connects to real-world problems."
    ],
    "avoid": [
      "You would rather avoid purely routine hands-on work.",
      "You prefer to avoid work that never asks you to think broadly.",
      "You would rather avoid purely routine production work."
    ]
  },
  "finance": {
    "choose": [
      "You enjoy money, investments, and financial decisions.",
      "You are comfortable with fast-moving, detail-heavy work.",
      "You want work that connects money to strategy."
    ],
    "avoid": [
      "You would rather avoid work far from numbers or money.",
      "You would rather avoid a role with little connection to finance.",
      "You do not enjoy work that stays far from numbers."
    ]
  },
  "finance-minor": {
    "choose": [
      "You enjoy money, investments, and financial decisions.",
      "You want work that connects money to strategy.",
      "You like making decisions from numbers and trends."
    ],
    "avoid": [
      "You would rather avoid work far from numbers or money.",
      "You do not enjoy work that stays far from numbers.",
      "You prefer to avoid routines with no analysis."
    ]
  },
  "human-resource-management": {
    "choose": [
      "You enjoy people, hiring, and workplace support.",
      "You enjoy solving people problems with structure and fairness.",
      "You like hiring, training, and supporting employees."
    ],
    "avoid": [
      "You would rather avoid isolated technical work.",
      "You do not enjoy solitary technical work.",
      "You prefer to avoid work with very little human interaction."
    ]
  },
  "human-resource-management-minor": {
    "choose": [
      "You enjoy people, hiring, and workplace support.",
      "You are comfortable handling confidential information.",
      "You enjoy solving people problems with structure and fairness."
    ],
    "avoid": [
      "You would rather avoid isolated technical work.",
      "You would rather avoid highly technical coding tasks.",
      "You do not enjoy solitary technical work."
    ]
  },
  "international-business-minor": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "international-economics-minor": {
    "choose": [
      "You enjoy markets, incentives, and policy.",
      "You like explaining why people and organizations make choices.",
      "You are comfortable with theory that connects to real-world problems."
    ],
    "avoid": [
      "You would rather avoid purely routine hands-on work.",
      "You prefer to avoid work that never asks you to think broadly.",
      "You would rather avoid purely routine production work."
    ]
  },
  "investments-minor": {
    "choose": [
      "You enjoy money, investments, and financial decisions.",
      "You like making decisions from numbers and trends.",
      "You are comfortable with fast-moving, detail-heavy work."
    ],
    "avoid": [
      "You would rather avoid work far from numbers or money.",
      "You prefer to avoid routines with no analysis.",
      "You would rather avoid a role with little connection to finance."
    ]
  },
  "management-information-systems": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "management-information-systems-minor": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "marketing": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "marketing-minor": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You are comfortable presenting ideas and persuading people.",
      "You prefer work that mixes creativity with deadlines."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You would rather avoid repetitive data entry.",
      "You do not enjoy highly technical or lab-based work."
    ]
  },
  "professional-selling-minor": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "sports-business-minor": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "academic-and-behavioral-strategist-bt": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "adapted-physical-education-minor": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "addiction-counseling-gc-gradcert": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "adventure-tourism-minor": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You enjoy helping people improve through movement and feedback.",
      "You like active, hands-on work with people."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You do not enjoy low-movement or sedentary jobs.",
      "You prefer to avoid work with little direct human interaction."
    ]
  },
  "adventure-education-education-minor": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "business-education-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "child-and-adolescent-studies-ma": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "child-advocacy-studies-minor": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "clinical-mental-health-counseling-ms-masters": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "coaching-minor": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "developmental-disabilities-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "director-of-special-education": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You are comfortable speaking in front of groups.",
      "You enjoy steady routines with people and structure."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You would rather avoid roles that stay far from teaching or mentoring.",
      "You do not enjoy repetition and classroom routines."
    ]
  },
  "early-childhood-education-birth-3": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "early-childhood-elementary-education": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "education-doc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "educational-leadership-ms": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "elementary-education-k-6-education": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "human-services-professional-ms": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You are comfortable connecting policy, data, and people.",
      "You enjoy work that can improve population outcomes."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You would rather avoid highly isolated technical research.",
      "You do not enjoy only one-on-one clinical care."
    ]
  },
  "innovative-instructional-leadership-k-12-gc": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "mental-health-in-schools-and-organizations": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "multicultural-education-gc-gradcert": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "organizational-leadership-gc": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You are comfortable speaking in front of groups.",
      "You enjoy steady routines with people and structure."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You would rather avoid roles that stay far from teaching or mentoring.",
      "You do not enjoy repetition and classroom routines."
    ]
  },
  "organizational-leadership-ms": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You enjoy steady routines with people and structure.",
      "You like planning lessons and explaining ideas clearly."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You do not enjoy repetition and classroom routines.",
      "You prefer to avoid work with little student interaction."
    ]
  },
  "physical-education-teaching": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You like active, hands-on work with people.",
      "You are comfortable coaching, training, or guiding others."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You prefer to avoid work with little direct human interaction.",
      "You would rather avoid purely abstract theory."
    ]
  },
  "principle-k12-12-licensure": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You enjoy steady routines with people and structure.",
      "You like planning lessons and explaining ideas clearly."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You do not enjoy repetition and classroom routines.",
      "You prefer to avoid work with little student interaction."
    ]
  },
  "principle-k12-12-specialist": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "reading-instruction-minor": {
    "choose": [
      "You enjoy a smaller education or teaching add-on.",
      "You are comfortable speaking in front of groups.",
      "You enjoy steady routines with people and structure."
    ],
    "avoid": [
      "You would rather avoid a path that stays far from classrooms or students.",
      "You would rather avoid roles that stay far from teaching or mentoring.",
      "You do not enjoy repetition and classroom routines."
    ]
  },
  "school-counseling-ms": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You are comfortable connecting policy, data, and people.",
      "You enjoy work that can improve population outcomes."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You would rather avoid highly isolated technical research.",
      "You do not enjoy only one-on-one clinical care."
    ]
  },
  "science-middle-level-teaching-minor": {
    "choose": [
      "You enjoy a smaller education or teaching add-on.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid a path that stays far from classrooms or students.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "special-education-minor": {
    "choose": [
      "You enjoy a smaller education or teaching add-on.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid a path that stays far from classrooms or students.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "sport-leadership": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You enjoy helping people improve through movement and feedback.",
      "You like active, hands-on work with people."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You do not enjoy low-movement or sedentary jobs.",
      "You prefer to avoid work with little direct human interaction."
    ]
  },
  "sport-management-ms": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "sport-leadership-gc": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You like organizing projects and keeping teams aligned.",
      "You are comfortable making practical decisions across departments."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You prefer to avoid work that stays purely creative.",
      "You would rather avoid isolated technical settings."
    ]
  },
  "superintendent-k-12-licensure": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "superintendent-k-12-specialist": {
    "choose": [
      "You enjoy school leadership and administration.",
      "You like planning lessons and explaining ideas clearly.",
      "You are comfortable speaking in front of groups."
    ],
    "avoid": [
      "You would rather avoid quiet solo work with little people management.",
      "You prefer to avoid work with little student interaction.",
      "You would rather avoid roles that stay far from teaching or mentoring."
    ]
  },
  "training-and-development-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "training-and-development-gc": {
    "choose": [
      "You enjoy people, hiring, and workplace support.",
      "You like hiring, training, and supporting employees.",
      "You are comfortable handling confidential information."
    ],
    "avoid": [
      "You would rather avoid isolated technical work.",
      "You prefer to avoid work with very little human interaction.",
      "You would rather avoid highly technical coding tasks."
    ]
  },
  "advertising": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "advertising-minor": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "applied-and-professional-writing-minor": {
    "choose": [
      "You enjoy a smaller humanities or communication add-on.",
      "You enjoy connecting big questions to real situations.",
      "You like understanding people, culture, and society."
    ],
    "avoid": [
      "You would rather avoid a path that is too technical or rigid.",
      "You do not enjoy pure math or engineering-style problem solving.",
      "You prefer to avoid highly repetitive procedures."
    ]
  },
  "applied-communication-studies": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "art-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "arts-administration-minor": {
    "choose": [
      "You enjoy a smaller humanities or communication add-on.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid a path that is too technical or rigid.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "bilingual-bicultural-education-minor": {
    "choose": [
      "You enjoy a smaller education or teaching add-on.",
      "You are comfortable speaking in front of groups.",
      "You enjoy steady routines with people and structure."
    ],
    "avoid": [
      "You would rather avoid a path that stays far from classrooms or students.",
      "You would rather avoid roles that stay far from teaching or mentoring.",
      "You do not enjoy repetition and classroom routines."
    ]
  },
  "chinese-studies-minor": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You like communication across different communities or countries.",
      "You are comfortable learning how people think in different contexts."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You prefer to avoid repetitive work with little communication.",
      "You would rather avoid settings with no cultural or global connection."
    ]
  },
  "communication-arts-and-literature-middle-level-teaching-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You like storytelling, design, music, or performance.",
      "You are comfortable revising work through feedback."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You prefer to avoid purely technical problem solving.",
      "You would rather avoid work with little room for creativity."
    ]
  },
  "communication-arts-and-literature-teaching": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "communication-studies-teaching-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "communication-studies-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "conflict-studies-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "corrections-and-justice-services": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "creative-digital-media": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "creative-digital-media-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "creative-writing-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You like storytelling, design, music, or performance.",
      "You are comfortable revising work through feedback."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You prefer to avoid purely technical problem solving.",
      "You would rather avoid work with little room for creativity."
    ]
  },
  "criminal-justice-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "dance-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "english-literature-and-language-minor": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You like communication across different communities or countries.",
      "You are comfortable learning how people think in different contexts."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You prefer to avoid repetitive work with little communication.",
      "You would rather avoid settings with no cultural or global connection."
    ]
  },
  "ethics-minor": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You enjoy reading, writing, and building arguments.",
      "You like understanding rules, systems, and public decisions."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You do not enjoy pure number-crunching.",
      "You prefer to avoid work with very little reading or writing."
    ]
  },
  "ethnic-studies-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "film-studies": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "film-studies-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "geography-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "global-studies": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "global-studies-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "graphic-design": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You like storytelling, design, music, or performance.",
      "You are comfortable revising work through feedback."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You prefer to avoid purely technical problem solving.",
      "You would rather avoid work with little room for creativity."
    ]
  },
  "history": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You enjoy connecting big questions to real situations.",
      "You like understanding people, culture, and society."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You do not enjoy pure math or engineering-style problem solving.",
      "You prefer to avoid highly repetitive procedures."
    ]
  },
  "history-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "history-of-art-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "i-design": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You like debugging, coding, and working with data.",
      "You are comfortable learning new tools as technology changes."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You prefer to avoid repetitive manual work.",
      "You would rather avoid work that changes very little from day to day."
    ]
  },
  "individualized-studies": {
    "choose": [
      "You enjoy building a custom path across interests.",
      "You enjoy a program that can be tailored to what matters to you.",
      "You like flexibility and connecting multiple interests."
    ],
    "avoid": [
      "You would rather avoid a very rigid track.",
      "You do not enjoy lack of flexibility or customization.",
      "You prefer to avoid following one narrow track end to end."
    ]
  },
  "individualized-studies-minor": {
    "choose": [
      "You enjoy building a custom path across interests.",
      "You like flexibility and connecting multiple interests.",
      "You are comfortable making your own choices and goals."
    ],
    "avoid": [
      "You would rather avoid a very rigid track.",
      "You prefer to avoid following one narrow track end to end.",
      "You would rather avoid a program with no room for individual direction."
    ]
  },
  "instrumental-music-education-teaching": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "japanese-studies-minor": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You enjoy building fluency or working in international settings.",
      "You like communication across different communities or countries."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You do not enjoy heavy technical or lab-based work.",
      "You prefer to avoid repetitive work with little communication."
    ]
  },
  "latinx-studies-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "law-3+3": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You like understanding rules, systems, and public decisions.",
      "You are comfortable with discussion and detailed analysis."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You prefer to avoid work with very little reading or writing.",
      "You would rather avoid repetitive technical routines."
    ]
  },
  "law-and-society": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You enjoy reading, writing, and building arguments.",
      "You like understanding rules, systems, and public decisions."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You do not enjoy pure number-crunching.",
      "You prefer to avoid work with very little reading or writing."
    ]
  },
  "leadership-and-advocacy-communications": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "legal-studies": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You enjoy reading, writing, and building arguments.",
      "You like understanding rules, systems, and public decisions."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You do not enjoy pure number-crunching.",
      "You prefer to avoid work with very little reading or writing."
    ]
  },
  "legal-studies-minor": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You like understanding rules, systems, and public decisions.",
      "You are comfortable with discussion and detailed analysis."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You prefer to avoid work with very little reading or writing.",
      "You would rather avoid repetitive technical routines."
    ]
  },
  "liberal-arts-and-sciences-aa": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "mass-communication-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "music": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "music-teaching": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "music-business": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "music-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "music-performance": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "organizational-and-corporate-communication": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You like organizing projects and keeping teams aligned.",
      "You are comfortable making practical decisions across departments."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You prefer to avoid work that stays purely creative.",
      "You would rather avoid isolated technical settings."
    ]
  },
  "paralegal-studies-gc": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You like understanding rules, systems, and public decisions.",
      "You are comfortable with discussion and detailed analysis."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You prefer to avoid work with very little reading or writing.",
      "You would rather avoid repetitive technical routines."
    ]
  },
  "philosophy-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "photography-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "police-science": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "political-science": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "political-science-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "psychology": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You enjoy connecting big questions to real situations.",
      "You like understanding people, culture, and society."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You do not enjoy pure math or engineering-style problem solving.",
      "You prefer to avoid highly repetitive procedures."
    ]
  },
  "psychology-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "public-administration": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You like understanding rules, systems, and public decisions.",
      "You are comfortable with discussion and detailed analysis."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You prefer to avoid work with very little reading or writing.",
      "You would rather avoid repetitive technical routines."
    ]
  },
  "public-administration-minor": {
    "choose": [
      "You enjoy rules, policy, and argument.",
      "You are comfortable with discussion and detailed analysis.",
      "You enjoy reading, writing, and building arguments."
    ],
    "avoid": [
      "You would rather avoid lab work or pure number-crunching.",
      "You would rather avoid repetitive technical routines.",
      "You do not enjoy pure number-crunching."
    ]
  },
  "public-relations": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "public-relations-minor": {
    "choose": [
      "You enjoy brand messaging and audience strategy.",
      "You prefer work that mixes creativity with deadlines.",
      "You like creative work with measurable results."
    ],
    "avoid": [
      "You would rather avoid purely technical or lab-based work.",
      "You do not enjoy highly technical or lab-based work.",
      "You prefer to avoid back-room work with little communication."
    ]
  },
  "social-science-history-teaching": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "social-studies-middle-level-teaching-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "sociology": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "sociology-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "spanish": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You enjoy building fluency or working in international settings.",
      "You like communication across different communities or countries."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You do not enjoy heavy technical or lab-based work.",
      "You prefer to avoid repetitive work with little communication."
    ]
  },
  "spanish-teaching": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You like communication across different communities or countries.",
      "You are comfortable learning how people think in different contexts."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You prefer to avoid repetitive work with little communication.",
      "You would rather avoid settings with no cultural or global connection."
    ]
  },
  "spanish-minor": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You enjoy building fluency or working in international settings.",
      "You like communication across different communities or countries."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You do not enjoy heavy technical or lab-based work.",
      "You prefer to avoid repetitive work with little communication."
    ]
  },
  "strategic-communication": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "studio-art": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "studio-art-minor": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "teaching-english-as-a-second-language": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You enjoy building fluency or working in international settings.",
      "You like communication across different communities or countries."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You do not enjoy heavy technical or lab-based work.",
      "You prefer to avoid repetitive work with little communication."
    ]
  },
  "teaching-english-as-a-second-language-minor": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You enjoy building fluency or working in international settings.",
      "You like communication across different communities or countries."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You do not enjoy heavy technical or lab-based work.",
      "You prefer to avoid repetitive work with little communication."
    ]
  },
  "theatre": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "theatre-minor": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "vocal-music-education-teaching": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You are comfortable revising work through feedback.",
      "You enjoy turning ideas into something people can see or hear."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You would rather avoid work with little room for creativity.",
      "You do not enjoy repetitive data-heavy work."
    ]
  },
  "womens-gender-and-sexuality-studies-minor": {
    "choose": [
      "You enjoy ideas, people, and social questions.",
      "You like understanding people, culture, and society.",
      "You are comfortable analyzing ideas from different angles."
    ],
    "avoid": [
      "You would rather avoid lab-based technical work.",
      "You prefer to avoid highly repetitive procedures.",
      "You would rather avoid work with very little reading or writing."
    ]
  },
  "world-languages": {
    "choose": [
      "You enjoy language practice and cross-cultural communication.",
      "You like communication across different communities or countries.",
      "You are comfortable learning how people think in different contexts."
    ],
    "avoid": [
      "You would rather avoid work with little communication or culture.",
      "You prefer to avoid repetitive work with little communication.",
      "You would rather avoid settings with no cultural or global connection."
    ]
  },
  "adult-gerontology-acute-care-nurse-practitioner-gc-gradcert": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "adult-gerontology-clincal-nurse-specialist-doc": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "adult-gerontology-clinical-nurse-specialist-gc": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "athletic-training": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You like active, hands-on work with people.",
      "You are comfortable coaching, training, or guiding others."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You prefer to avoid work with little direct human interaction.",
      "You would rather avoid purely abstract theory."
    ]
  },
  "athletic-training-ms-masters": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You like active, hands-on work with people.",
      "You are comfortable coaching, training, or guiding others."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You prefer to avoid work with little direct human interaction.",
      "You would rather avoid purely abstract theory."
    ]
  },
  "clinical-exercise-science": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "doctoral-adult-gerontology-acute-care-nurse-practitioner-doc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "exercise-science": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "family-nurse-practitioner-doc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "family-nurse-practitioner-gc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "healthcare-leadership-ms": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You are comfortable making practical decisions across departments.",
      "You enjoy leadership and day-to-day operations."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You would rather avoid isolated technical settings.",
      "You do not enjoy repetitive routine work."
    ]
  },
  "healthcare-leadership-and-administration": {
    "choose": [
      "You enjoy team coordination and business operations.",
      "You enjoy leadership and day-to-day operations.",
      "You like organizing projects and keeping teams aligned."
    ],
    "avoid": [
      "You would rather avoid narrow technical specialization.",
      "You do not enjoy repetitive routine work.",
      "You prefer to avoid work that stays purely creative."
    ]
  },
  "movement-science": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You like active, hands-on work with people.",
      "You are comfortable coaching, training, or guiding others."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You prefer to avoid work with little direct human interaction.",
      "You would rather avoid purely abstract theory."
    ]
  },
  "nurse-educator-doc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "nurse-educator-gc": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You are comfortable working through structured coursework.",
      "You enjoy a subject that gives you room to grow."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You would rather avoid a path that feels too rigid.",
      "You do not enjoy programs with little room to explore."
    ]
  },
  "nurse-educator-ms": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "nursing": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "nursing-leadership-dnp": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You like helping people through detailed, hands-on work.",
      "You are comfortable with responsibility and fast-moving situations."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You prefer to avoid squeamish or invasive tasks.",
      "You would rather avoid work with little patient contact."
    ]
  },
  "nursing-leadership-ms": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You like helping people through detailed, hands-on work.",
      "You are comfortable with responsibility and fast-moving situations."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You prefer to avoid squeamish or invasive tasks.",
      "You would rather avoid work with little patient contact."
    ]
  },
  "nursing-rn-to-bs": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  },
  "nutrition-minor": {
    "choose": [
      "You enjoy community health and prevention.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "performance-analytics-in-sport-science": {
    "choose": [
      "You enjoy creative expression and communication.",
      "You enjoy turning ideas into something people can see or hear.",
      "You like storytelling, design, music, or performance."
    ],
    "avoid": [
      "You would rather avoid rigid or highly technical work.",
      "You do not enjoy repetitive data-heavy work.",
      "You prefer to avoid purely technical problem solving."
    ]
  },
  "psychiatric-mental-health-nurse-practioner-dnp": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "psychiatric-mental-health-nurse-practioner-gc": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You are comfortable connecting policy, data, and people.",
      "You enjoy work that can improve population outcomes."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You would rather avoid highly isolated technical research.",
      "You do not enjoy only one-on-one clinical care."
    ]
  },
  "public-health-minor": {
    "choose": [
      "You enjoy community health and prevention.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "public-health-community-health": {
    "choose": [
      "You enjoy community health and prevention.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "public-health-epidemiology": {
    "choose": [
      "You enjoy community health and prevention.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "public-health-health-administration": {
    "choose": [
      "You enjoy community health and prevention.",
      "You are comfortable connecting policy, data, and people.",
      "You enjoy work that can improve population outcomes."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You would rather avoid highly isolated technical research.",
      "You do not enjoy only one-on-one clinical care."
    ]
  },
  "public-health-health-nutrition": {
    "choose": [
      "You enjoy community health and prevention.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "recreation-and-tourism": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "school-health-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "social-work-bsw": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You like prevention, education, and systems thinking.",
      "You are comfortable connecting policy, data, and people."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You prefer to avoid health work with no policy or systems component.",
      "You would rather avoid highly isolated technical research."
    ]
  },
  "social-work-msw": {
    "choose": [
      "You enjoy supporting people through difficult situations.",
      "You enjoy work that can improve population outcomes.",
      "You like prevention, education, and systems thinking."
    ],
    "avoid": [
      "You would rather avoid detached solo work with little human contact.",
      "You do not enjoy only one-on-one clinical care.",
      "You prefer to avoid health work with no policy or systems component."
    ]
  },
  "strength-and-conditioning": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "therapeutic-recreation": {
    "choose": [
      "You enjoy movement, coaching, and active learning.",
      "You are comfortable coaching, training, or guiding others.",
      "You enjoy helping people improve through movement and feedback."
    ],
    "avoid": [
      "You would rather avoid sedentary office work.",
      "You would rather avoid purely abstract theory.",
      "You do not enjoy low-movement or sedentary jobs."
    ]
  },
  "wound-ostomy-and-continence-nursing": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  },
  "allied-health-biology": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You like testing ideas and observing how systems behave.",
      "You are comfortable with precision, measurement, and procedure."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You prefer to avoid highly subjective assignments.",
      "You would rather avoid too much public-facing persuasion work."
    ]
  },
  "applied-computer-science": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "biochemistry-major": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "biochemistry-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "bioinformatics": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "bioinformatics-minor": {
    "choose": [
      "You enjoy technology basics and applied problem solving.",
      "You like debugging, coding, and working with data.",
      "You are comfortable learning new tools as technology changes."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You prefer to avoid repetitive manual work.",
      "You would rather avoid work that changes very little from day to day."
    ]
  },
  "biology-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "cell-and-molecular-biology": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "chemistry": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "chemistry-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "chemistry-acs": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "chemistry-teaching-acs": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "chemistry-and-physical-science-teaching": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You like testing ideas and observing how systems behave.",
      "You are comfortable with precision, measurement, and procedure."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You prefer to avoid highly subjective assignments.",
      "You would rather avoid too much public-facing persuasion work."
    ]
  },
  "composite-materials-engineering": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You enjoy building things that have to work in the real world.",
      "You like math, physics, and hands-on problem solving."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You do not enjoy work that ignores math and measurement.",
      "You prefer to avoid open-ended creative writing."
    ]
  },
  "computer-information-systems": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You like debugging, coding, and working with data.",
      "You are comfortable learning new tools as technology changes."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You prefer to avoid repetitive manual work.",
      "You would rather avoid work that changes very little from day to day."
    ]
  },
  "computer-science": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "computer-science-minor": {
    "choose": [
      "You enjoy technology basics and applied problem solving.",
      "You are comfortable learning new tools as technology changes.",
      "You enjoy making complex systems work reliably."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You would rather avoid work that changes very little from day to day.",
      "You do not enjoy people-only roles with little technical problem solving."
    ]
  },
  "computer-technology-minor": {
    "choose": [
      "You enjoy technology basics and applied problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "data-science": {
    "choose": [
      "You enjoy coding, systems, and technical problem solving.",
      "You are comfortable learning new tools as technology changes.",
      "You enjoy making complex systems work reliably."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You would rather avoid work that changes very little from day to day.",
      "You do not enjoy people-only roles with little technical problem solving."
    ]
  },
  "data-science-minor": {
    "choose": [
      "You enjoy technology basics and applied problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "earth-science": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You like testing ideas and observing how systems behave.",
      "You are comfortable with precision, measurement, and procedure."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You prefer to avoid highly subjective assignments.",
      "You would rather avoid too much public-facing persuasion work."
    ]
  },
  "earth-science-teaching": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You like testing ideas and observing how systems behave.",
      "You are comfortable with precision, measurement, and procedure."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You prefer to avoid highly subjective assignments.",
      "You would rather avoid too much public-facing persuasion work."
    ]
  },
  "ecology": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "environmental-chemistry-acs": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "environmental-science-biology": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "environmental-science-geoscience": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "general-engineering-electronics": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You enjoy building things that have to work in the real world.",
      "You like math, physics, and hands-on problem solving."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You do not enjoy work that ignores math and measurement.",
      "You prefer to avoid open-ended creative writing."
    ]
  },
  "general-engineering-industrial-statistics": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You are comfortable with precise work and clear specifications.",
      "You enjoy building things that have to work in the real world."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You would rather avoid pure desk work with no technical component.",
      "You do not enjoy work that ignores math and measurement."
    ]
  },
  "geology": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "geoscience-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You like testing ideas and observing how systems behave.",
      "You are comfortable with precision, measurement, and procedure."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You prefer to avoid highly subjective assignments.",
      "You would rather avoid too much public-facing persuasion work."
    ]
  },
  "geospatial-information-science-minor": {
    "choose": [
      "You enjoy technology basics and applied problem solving.",
      "You enjoy making complex systems work reliably.",
      "You like debugging, coding, and working with data."
    ],
    "avoid": [
      "You would rather avoid people-only work with no technical problem solving.",
      "You do not enjoy people-only roles with little technical problem solving.",
      "You prefer to avoid repetitive manual work."
    ]
  },
  "life-science-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "materials-chemistry-acs": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You are comfortable with precise work and clear specifications.",
      "You enjoy building things that have to work in the real world."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You would rather avoid pure desk work with no technical component.",
      "You do not enjoy work that ignores math and measurement."
    ]
  },
  "mathematics-middle-level-teaching": {
    "choose": [
      "You enjoy a smaller education or teaching add-on.",
      "You are comfortable speaking in front of groups.",
      "You enjoy steady routines with people and structure."
    ],
    "avoid": [
      "You would rather avoid a path that stays far from classrooms or students.",
      "You would rather avoid roles that stay far from teaching or mentoring.",
      "You do not enjoy repetition and classroom routines."
    ]
  },
  "mathematics-secondary-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "mathematics": {
    "choose": [
      "You enjoy patterns, data, and quantitative reasoning.",
      "You like solving problems with logic and numbers.",
      "You are comfortable with abstract ideas that have clear rules."
    ],
    "avoid": [
      "You would rather avoid subjective or unstructured work.",
      "You prefer to avoid highly unstructured projects.",
      "You would rather avoid work with little to no numbers."
    ]
  },
  "mathematics-bs-minor": {
    "choose": [
      "You enjoy patterns, data, and quantitative reasoning.",
      "You are comfortable with abstract ideas that have clear rules.",
      "You enjoy finding answers in graphs, models, and evidence."
    ],
    "avoid": [
      "You would rather avoid subjective or unstructured work.",
      "You would rather avoid work with little to no numbers.",
      "You do not enjoy repeated writing-heavy assignments."
    ]
  },
  "medical-laboratory-science-bs-major": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "physical-science-teaching": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "physics": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You are comfortable with precision, measurement, and procedure.",
      "You enjoy learning how the natural world works."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You would rather avoid too much public-facing persuasion work.",
      "You do not enjoy jobs that stay far from science and evidence."
    ]
  },
  "physics-teaching": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "physics-electronics-minor": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You are comfortable with precise work and clear specifications.",
      "You enjoy building things that have to work in the real world."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You would rather avoid pure desk work with no technical component.",
      "You do not enjoy work that ignores math and measurement."
    ]
  },
  "physics-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "polymer-chemistry-minor": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You are comfortable with precise work and clear specifications.",
      "You enjoy building things that have to work in the real world."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You would rather avoid pure desk work with no technical component.",
      "You do not enjoy work that ignores math and measurement."
    ]
  },
  "radiography": {
    "choose": [
      "You enjoy patient care and clinical practice.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid low-contact desk work.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  },
  "statistics": {
    "choose": [
      "You enjoy patterns, data, and quantitative reasoning.",
      "You enjoy finding answers in graphs, models, and evidence.",
      "You like solving problems with logic and numbers."
    ],
    "avoid": [
      "You would rather avoid subjective or unstructured work.",
      "You do not enjoy repeated writing-heavy assignments.",
      "You prefer to avoid highly unstructured projects."
    ]
  },
  "statistics-minor": {
    "choose": [
      "You enjoy patterns, data, and quantitative reasoning.",
      "You are comfortable with abstract ideas that have clear rules.",
      "You enjoy finding answers in graphs, models, and evidence."
    ],
    "avoid": [
      "You would rather avoid subjective or unstructured work.",
      "You would rather avoid work with little to no numbers.",
      "You do not enjoy repeated writing-heavy assignments."
    ]
  },
  "sustainability-minor": {
    "choose": [
      "You enjoy lab work and evidence-based problem solving.",
      "You enjoy learning how the natural world works.",
      "You like testing ideas and observing how systems behave."
    ],
    "avoid": [
      "You would rather avoid work with no clear method.",
      "You do not enjoy jobs that stay far from science and evidence.",
      "You prefer to avoid highly subjective assignments."
    ]
  },
  "pre-chiropractic-medicine": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You like helping people through detailed, hands-on work.",
      "You are comfortable with responsibility and fast-moving situations."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You prefer to avoid squeamish or invasive tasks.",
      "You would rather avoid work with little patient contact."
    ]
  },
  "pre-dentistry": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "pre-engineering": {
    "choose": [
      "You enjoy designing and improving systems.",
      "You enjoy building things that have to work in the real world.",
      "You like math, physics, and hands-on problem solving."
    ],
    "avoid": [
      "You would rather avoid abstract theory without application.",
      "You do not enjoy work that ignores math and measurement.",
      "You prefer to avoid open-ended creative writing."
    ]
  },
  "pre-forensics": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You enjoy a subject that gives you room to grow.",
      "You like learning through a program with clear goals."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You do not enjoy programs with little room to explore.",
      "You prefer to avoid work that feels disconnected from your interests."
    ]
  },
  "pre-law": {
    "choose": [
      "You enjoy law, policy, and legal reasoning.",
      "You are comfortable with discussion and detailed analysis.",
      "You enjoy reading, writing, and building arguments."
    ],
    "avoid": [
      "You would rather avoid work that is far from law or policy.",
      "You would rather avoid repetitive technical routines.",
      "You do not enjoy pure number-crunching."
    ]
  },
  "pre-medicine-sequence": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "pre-medicine-gc": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You like helping people through detailed, hands-on work.",
      "You are comfortable with responsibility and fast-moving situations."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You prefer to avoid squeamish or invasive tasks.",
      "You would rather avoid work with little patient contact."
    ]
  },
  "pre-occupational-therapy": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "pre-optometry": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  },
  "pre-pharmacy": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "pre-physical-therapy": {
    "choose": [
      "You enjoy a mix of ideas, people, and practical work.",
      "You like learning through a program with clear goals.",
      "You are comfortable working through structured coursework."
    ],
    "avoid": [
      "You would rather avoid a very narrow track.",
      "You prefer to avoid work that feels disconnected from your interests.",
      "You would rather avoid a path that feels too rigid."
    ]
  },
  "pre-physician-assistant": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You like helping people through detailed, hands-on work.",
      "You are comfortable with responsibility and fast-moving situations."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You prefer to avoid squeamish or invasive tasks.",
      "You would rather avoid work with little patient contact."
    ]
  },
  "pre-physician-assistant-gc": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  },
  "pre-podiatry": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You are comfortable with responsibility and fast-moving situations.",
      "You want work that has a direct impact on patient outcomes."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You would rather avoid work with little patient contact.",
      "You do not enjoy stressful or emotional situations."
    ]
  },
  "pre-veterinary": {
    "choose": [
      "You enjoy healthcare prerequisites and clinical preparation.",
      "You want work that has a direct impact on patient outcomes.",
      "You like helping people through detailed, hands-on work."
    ],
    "avoid": [
      "You would rather avoid work that is far from patient care or health science.",
      "You do not enjoy stressful or emotional situations.",
      "You prefer to avoid squeamish or invasive tasks."
    ]
  }
} as const;

const defaultTraits = {
  choose: [
    'You enjoy a mix of ideas, people, and practical work.',
    'You like learning through a program with clear goals.',
    'You are comfortable working through structured coursework.'
  ],
  avoid: [
    'You would rather avoid a very narrow track.',
    'You do not enjoy programs with little room to explore.',
    'You prefer to avoid work that feels disconnected from your interests.'
  ]
};

export const buildProgramFitTraits = (program: Program) => {
  const traits = rawProgramFitTraits[program.program_id] ?? defaultTraits;
  return {
    you_might_like: traits.choose,
    not_for_you: traits.avoid
  };
};
