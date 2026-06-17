import React, { useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, FolderKanban, Sparkles, UsersRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PuerLogo } from "@/src/components/layout/PuerLogo";
import { cn } from "@/src/lib/utils";

interface OnboardingIntroProps {
  userName?: string;
  onComplete: () => void;
}

const slides = [
  {
    kicker: "Welcome to PUER",
    title: "A simple home for Group Puer's project work.",
    description:
      "PUER Management brings the CEIT 435 workflow into one clean space: projects, tasks, milestones, contribution tracking, and team coordination.",
    icon: Sparkles,
    points: ["Group Puer workspace", "Progress-focused dashboard", "Cleaner project flow"],
  },
  {
    kicker: "Project Progress",
    title: "Follow milestones without losing the big picture.",
    description:
      "The dashboard summarizes active projects, completed tasks, upcoming deadlines, and recent group activity so the team can see what changed at a glance.",
    icon: BarChart3,
    points: ["Milestone progress", "Recent activity", "Task completion stats"],
  },
  {
    kicker: "Task Workflow",
    title: "Move work through clear project boards.",
    description:
      "Each project opens into a kanban-style board where tasks can be created, updated, assigned, reviewed, and moved across workflow columns.",
    icon: FolderKanban,
    points: ["Kanban board", "Task details", "Team collaboration"],
  },
  {
    kicker: "Templates & Planning",
    title: "Start faster with general and education templates.",
    description:
      "PUER includes templates for group projects, exam prep, software sprints, research workflows, and selected education use cases.",
    icon: ClipboardList,
    points: ["General templates", "Education templates", "Starter tasks"],
  },
  {
    kicker: "Evaluation & QA",
    title: "Use feedback to improve teamwork.",
    description:
      "The reports and user testing direction shaped a calmer interface with clearer navigation, dark mode, profile settings, peer evaluation, and deadline awareness.",
    icon: UsersRound,
    points: ["Peer evaluation", "Dark mode", "Profile personalization"],
  },
];

export const OnboardingIntro: React.FC<OnboardingIntroProps> = ({ userName, onComplete }) => {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Icon = slide.icon;
  const isLast = index === slides.length - 1;

  return (
    <div className="intro-light-scope fixed inset-0 z-[200] overflow-y-auto bg-[linear-gradient(135deg,#ffedd7_0%,#eef2ff_50%,#f8fbff_100%)] p-4 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center py-8">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative flex min-h-[560px] flex-col justify-between overflow-hidden border-b border-white/60 bg-white/40 p-7 lg:border-b-0 lg:border-r">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative">
              <div className="mb-10">
                <PuerLogo size="md" />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
                First setup
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                Hi{userName ? `, ${userName.split(" ")[0]}` : ""}. Let's set the map before the work begins.
              </h1>
              <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-600">
                This quick intro cannot be skipped because it explains how the project is meant to be used for the
                assignment workflow.
              </p>
            </div>

            <div className="relative grid gap-3">
              {slides.map((item, itemIndex) => (
                <div
                  key={item.title}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                    itemIndex === index
                      ? "border-orange-200 bg-orange-50 text-brand-primary shadow-lg shadow-orange-500/10"
                      : itemIndex < index
                        ? "border-emerald-100 bg-white/70 text-emerald-600"
                        : "border-white/70 bg-white/50 text-slate-500"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
                    {itemIndex < index ? <CheckCircle2 size={17} /> : <item.icon size={17} />}
                  </div>
                  <span className="text-sm font-black">{item.kicker}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="flex min-h-[560px] flex-col justify-between p-7 md:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {slides.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      item.title === slide.title ? "w-10 bg-brand-primary" : "w-2 bg-slate-200"
                    )}
                  />
                ))}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                {index + 1}/{slides.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="flex-1"
              >
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-orange-50 text-brand-primary shadow-lg shadow-orange-500/10">
                  <Icon size={34} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">{slide.kicker}</p>
                <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  {slide.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">{slide.description}</p>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {slide.points.map((point) => (
                    <div key={point} className="rounded-2xl border border-slate-100 bg-white/75 p-4">
                      <CheckCircle2 size={18} className="mb-3 text-emerald-500" />
                      <p className="text-sm font-black text-slate-800">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
                disabled={index === 0}
                className="rounded-2xl px-5 py-3 text-sm font-black text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => (isLast ? onComplete() : setIndex((current) => current + 1))}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-400 px-6 font-black text-white shadow-xl shadow-orange-500/20 transition-transform hover:-translate-y-0.5"
              >
                {isLast ? "Start using Puer" : "Continue"}
                <ArrowRight size={18} />
              </button>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
};
