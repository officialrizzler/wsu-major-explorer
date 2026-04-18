import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowRight, LineChart, Landmark, MessageSquareText, BarChart3, Globe2, ExternalLink } from 'lucide-react';
import DynamicBackground from '../components/DynamicBackground';
import { dataSources } from '../data/wsuData';

const useAnimateOnScroll = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);
};

const SourceIcon: React.FC<{ source: { source_id: string; source_name: string; source_url: string } }> = ({ source }) => {
  const sourceKey = `${source.source_id} ${source.source_name} ${source.source_url}`.toLowerCase();

  if (sourceKey.includes('winona') || sourceKey.includes('wsu') || sourceKey.includes('catalog.winona.edu')) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-primary-700">
        <span className="text-xl font-black tracking-[-0.06em] leading-none">W</span>
      </div>
    );
  }

  if (sourceKey.includes('mn') || sourceKey.includes('deed') || sourceKey.includes('state.mn.us')) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700">
        <LineChart size={18} strokeWidth={2.2} />
      </div>
    );
  }

  if (sourceKey.includes('ipeds') || sourceKey.includes('nces')) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700">
        <Landmark size={18} strokeWidth={2.1} />
      </div>
    );
  }

  if (sourceKey.includes('rate my professors') || sourceKey.includes('ratemyprofessors')) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
        <MessageSquareText size={18} strokeWidth={2.1} />
      </div>
    );
  }

  if (sourceKey.includes('nsse')) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700">
        <BarChart3 size={18} strokeWidth={2.1} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-700">
      <Globe2 size={18} strokeWidth={2.1} />
    </div>
  );
};

const AboutPage: React.FC = () => {
  const dataSourceRef = useRef(null);
  useAnimateOnScroll(dataSourceRef);

  return (
    <div className="w-full">
      <Helmet>
        <title>About WSU Explorer | How It Works</title>
        <meta name="description" content="See how WSU Explorer organizes official data for major exploration, including data sources, methodology, limitations, and project context." />
        <link rel="canonical" href="https://explorewsu.com/about" />
      </Helmet>
      <DynamicBackground className="relative isolate min-h-[calc(100vh-64px)] px-4 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_28px_56px_-20px_rgba(0,0,0,0.16)] border border-white/30 p-6 pt-8 sm:p-10 sm:pt-12 md:p-12 md:pt-14 relative z-10">
          <div className="mx-auto max-w-5xl mb-14 sm:mb-16 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-950 animate-fade-in-up">
              Simplifying Academic Planning
            </h1>
          </div>

          <div className="mx-auto max-w-5xl mb-12 sm:mb-14">
            <p className="text-lg text-gray-700 font-body leading-8">
              WSU Explorer is a student-built platform designed to make major exploration easier for new students navigating a large and complex set of academic options. It brings program details, requirements, career context, and student-relevant insights into one unified experience so students can compare pathways without bouncing across disconnected sites. An AI advisor layer adds on-demand guidance by answering common WSU questions and helping students think through choices with more clarity. This project was supported by the AI Research and Engagement Pilot Fund, is not officially affiliated with Winona State University, and is not monetized.
            </p>
          </div>

          <div ref={dataSourceRef} className="pt-10 sm:pt-12 border-t border-gray-200/80 mb-12 sm:mb-14 scroll-animate max-w-6xl mx-auto">
            <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">Where The Data Comes From</h2>
            <p className="max-w-5xl mx-auto text-lg text-gray-600 font-body leading-8 text-left">
              Sources are selected based on relevance to student decision-making, public verifiability, and consistency over time, prioritizing official institutional and state-level data first. Supplemental sources are then added to provide additional context that helps students compare programs more clearly.
            </p>

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map((source) => (
                <div key={source.source_id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col h-full shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <SourceIcon source={source} />
                    <span className="text-xs font-bold font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                      {source.source_year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {source.source_name}
                  </h3>
                  <p className="text-sm text-gray-500 font-body leading-relaxed mb-6">
                    {source.source_notes}
                  </p>
                  <div className="mt-auto">
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-300 uppercase tracking-widest transition-colors"
                    >
                      Go to Source <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto pt-10 sm:pt-12 border-t border-gray-200/80">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-4">Methodology</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailBlock
                title="What this tool does"
                items={[
                  "Brings together key data from the catalog, IPAR, and state-level sources",
                  "Reformats complex major requirements so they are easier to read",
                  "Highlights fit-oriented traits to support program discovery",
                  "Links back to source material so you can verify details quickly"
                ]}
                tone="emerald"
              />
              <DetailBlock
                title="What this tool does not do"
                items={[
                  "It does not replace official advising, degree audits, or academic planning tools",
                  "It does not update in real time; published data is shown as a snapshot",
                  "It does not rank majors or score programs subjectively",
                  "It does not track individual progress, credits, or graduation status"
                ]}
                tone="rose"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white border border-amber-200/80 rounded-3xl p-7 sm:p-8 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.3)] hover:shadow-[0_18px_38px_-20px_rgba(0,0,0,0.35)] transition-shadow">
                <div className="flex gap-4 sm:gap-5">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 h-fit border border-amber-100">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Important Context</h3>
                    <p className="text-gray-700 font-body text-base leading-relaxed">
                      This project is informational only and is not an official WSU advising system.
                    </p>
                    <ul className="mt-4 space-y-2 list-disc pl-5 text-sm text-gray-600 marker:text-amber-500">
                      <li>Data is aggregated from public sources using APIs and automated collection methods.</li>
                      <li>AI supports chat and tagging features only; academic requirements are not AI-generated.</li>
                      <li>Missing or uncertain information is omitted or flagged instead of guessed.</li>
                    </ul>
                    <p className="text-gray-900 font-semibold pt-4">
                      Before making any decisions, please consult with an official WSU academic advisor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-[2rem] overflow-hidden bg-white border border-gray-200 shadow-xl max-w-5xl mx-auto mt-14 sm:mt-16">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl"></div>

            <div className="relative z-10 p-12 lg:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Have Feedback?</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-body">
                I'm actively improving this tool. If you spot an error or have a suggestion, I'd love to hear from you.
              </p>
              <a
                href="https://forms.gle/pVYDG87KTHPRW3u87"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-lg shadow-gray-900/20 font-body"
              >
                <ExternalLink size={18} /> Open Feedback Form
              </a>
            </div>
          </div>
        </div>
      </DynamicBackground>
    </div>
  );
};

const DetailBlock: React.FC<{ title: string, items: string[], tone: 'emerald' | 'rose' }> = ({ title, items, tone }) => {
  const isEmerald = tone === 'emerald';
  const badgeClass = isEmerald
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : 'bg-rose-50 text-rose-700 border-rose-100';
  const bulletClass = isEmerald ? 'bg-emerald-500' : 'bg-rose-500';

  return (
  <div className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/90 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.3)] transition-all">
    <h4 className={`inline-flex items-center justify-center px-4 py-2 rounded-full border text-sm font-semibold tracking-wide mb-5 mx-auto ${badgeClass}`}>{title}</h4>
    <ul className="space-y-3.5 font-body">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 text-gray-700 text-base">
          <div className={`mt-2 w-2 h-2 rounded-full ${bulletClass} flex-shrink-0`}></div>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  </div>
  );
};

export default AboutPage;
