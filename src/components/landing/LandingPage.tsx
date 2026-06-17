import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Moon,
  Star,
  Sun,
  UsersRound,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
} from "lucide-react";
import { PuerLogo } from "../layout/PuerLogo";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("puer_theme") || "light");

  // Sync theme changes with the document data attribute and localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("puer_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Typing Effect
  const typingWords = [
    "Team Accountability",
    "Fair Contribution",
    "Project Transparency",
    "Collaboration Efficiency",
  ];
  const [wordIdx, setWordIdx] = useState(0);
  const [subCharIdx, setSubCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subCharIdx === typingWords[wordIdx].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (subCharIdx === 0 && isDeleting) {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % typingWords.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubCharIdx((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 50 : 110);

    return () => clearTimeout(timeout);
  }, [subCharIdx, isDeleting, wordIdx]);

  const displayedText = typingWords[wordIdx].substring(0, subCharIdx);

  // Dynamic Theme Bindings to completely bypass selector / media query mismatches
  const isDark = theme === "dark";
  const bgStyle = {
    background: isDark
      ? "linear-gradient(135deg, #140b00 0%, #090a12 50%, #06090e 100%)"
      : "linear-gradient(135deg, #ffedd7 0%, #eef2ff 50%, #f8fbff 100%)",
    backgroundAttachment: "fixed" as const,
  };

  const textTitle = isDark ? "text-white" : "text-slate-900";
  const textBody = isDark ? "text-slate-200" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white/80 border-slate-200/60";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200/60";
  const headerBg = isDark ? "bg-slate-950/80 border-slate-900" : "bg-white/75 border-white/60";
  const btnOutline = isDark 
    ? "bg-slate-900/85 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900";

  return (
    <div style={bgStyle} className="min-h-screen transition-all duration-300 font-sans pb-16">
      
      {/* Header / Navbar */}
      <header className={`fixed inset-x-0 top-0 z-50 border-b ${headerBg} px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <PuerLogo size="md" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${borderCol} bg-slate-900/[0.03] dark:bg-white/[0.03] ${textBody} transition-colors hover:bg-orange-500/10 hover:text-brand-primary cursor-pointer`}
              title="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={onLogin}
              className={`px-4 py-2 text-sm font-bold ${textMuted} hover:${textTitle} transition-colors cursor-pointer`}
            >
              Sign In
            </button>

            <button
              onClick={onRegister}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-bold text-white bg-brand-primary rounded-xl hover:bg-orange-600 shadow-md shadow-brand-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 max-w-4xl mx-auto px-4 text-center">
        <div className={`inline-flex items-center gap-2 bg-orange-500/5 ${borderCol} border px-4 py-1.5 rounded-full text-xs font-bold text-brand-primary mb-6 shadow-sm`}>
          <SparklesIcon />
          <span>Fair & Data-Driven Team Collaboration</span>
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${textTitle} leading-tight`}>
          Maximize <br />
          <span className="text-brand-primary border-r-2 border-brand-primary pr-2">
            {displayedText}
          </span>
        </h1>

        <p className={`mt-6 text-base sm:text-lg ${textBody} max-w-2xl mx-auto leading-relaxed font-semibold`}>
          <strong className={textTitle}>Puer Management</strong> is a collaborative workspace designed to guarantee fairness in team projects. Track contributions, visualize milestones, and eliminate subjective peer-grading ambiguity.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={onRegister}
            className="px-8 py-3.5 font-bold text-white bg-brand-primary rounded-xl hover:bg-orange-600 shadow-lg shadow-brand-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Get Started Free
          </button>
          <button
            onClick={onLogin}
            className={`px-8 py-3.5 font-bold rounded-xl border ${btnOutline} transition-all cursor-pointer`}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Why Puer? Section (Bizi Neden Kullansınlar) */}
      <section className="py-16 border-t border-slate-200/40 dark:border-slate-800/40 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-black ${textTitle}`}>Why Puer Management?</h2>
          <p className={`text-sm ${textMuted} mt-2 font-bold`}>Solving team friction and ensuring grading fairness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-red-500 mb-4 bg-red-500/5 w-10 h-10 rounded-xl flex items-center justify-center border border-red-500/10">
              <AlertTriangle size={20} />
            </div>
            <h3 className={`font-bold ${textTitle} text-base`}>The Free-Rider Problem</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Tired of team members who contribute nothing but receive the same project grade? Puer tracks individual tasks and updates continuously to make everyone's work transparent.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4 bg-brand-primary/5 w-10 h-10 rounded-xl flex items-center justify-center border border-brand-primary/10">
              <Award size={20} />
            </div>
            <h3 className={`font-bold ${textTitle} text-base`}>Constructive Feedback</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Say goodbye to awkward, confrontational, or biased ratings. Puer offers structured, context-based peer evaluations (anonymous or named) that promote professional growth.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-indigo-500 mb-4 bg-indigo-500/5 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-500/10">
              <BookOpen size={20} />
            </div>
            <h3 className={`font-bold ${textTitle} text-base`}>Structured Academic Insights</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Students get fair recognition for their hard work. Instructors gain a clear, audit-ready dashboard of student metrics and peer feedback to justify grading.
            </p>
          </div>
        </div>
      </section>

      {/* Expanded Key Features Section */}
      <section className="py-16 border-t border-slate-200/40 dark:border-slate-800/40 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-black ${textTitle}`}>Key Features</h2>
          <p className={`text-sm ${textMuted} mt-2 font-bold`}>Everything you need to keep project workflows organized and accountable.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <FolderKanban size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Transparent Kanban Boards</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Organize tasks with status tracking, tags, and subtask checklists. Assign explicit tasks to ensure everyone knows their responsibilities.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Real-Time Contribution Charts</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Visualize project dynamics. Monitor individual progress metrics and team completion trends right from your centralized dashboard.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <Star size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Flexible Peer Evaluations</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Assess teammates constructs using customizable scorecards. Enable anonymous feedback modes to ensure objective, honest grading.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <Calendar size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Shared Project Calendar</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Synchronize due dates, milestones, and deliverables. Ensure no deadlines slip through the cracks with automated calendar views.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <LayoutDashboard size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Smart Project Templates</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Boot up workflows instantly. Select from templates suited for Agile development, design research, or general coursework sprints.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${cardBg} shadow-sm`}>
            <div className="text-brand-primary mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className={`font-bold ${textTitle} text-lg`}>Role-Based Collaboration</h3>
            <p className={`text-xs ${textMuted} mt-2.5 leading-relaxed font-semibold`}>
              Secure your workspace. Allocate editor and viewer roles to maintain structure, protecting codebases and data.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/40 dark:border-slate-800/40 max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <PuerLogo size="sm" />
          <p className="text-xs font-semibold text-slate-400">
            &copy; {new Date().getFullYear()} Puer Management. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Simple Sparkles SVG icon component
const SparklesIcon = () => (
  <svg
    className="h-3.5 w-3.5 text-brand-primary animate-pulse"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
  </svg>
);
