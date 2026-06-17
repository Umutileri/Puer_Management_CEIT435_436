import React, { useMemo, useState } from "react";
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from "@/src/constants";
import { Template } from "@/src/types";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Layout,
  Users,
  CalendarCheck,
  Code2,
  FlaskConical,
  PartyPopper,
  FileText,
  Cpu,
  MonitorPlay,
  Lightbulb,
  BarChart3,
  Wrench,
  Microscope,
  LineChart,
  Briefcase,
  Target,
  FileSearch,
  PenTool,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  selectedId?: string;
}

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // General
  "standard-group-project": Users,
  "standard-kanban": Layout,
  "exam-prep": CalendarCheck,
  // Education
  "lesson-plan-workflow": GraduationCap,
  "instructional-material": PenTool,
  "assessment-report": BookOpen,
  "practicum-tracking": ClipboardCheck,
  // CEIT
  "instructional-design-addie": Cpu,
  "elearning-course": MonitorPlay,
  "edtech-integration": Lightbulb,
  "learning-analytics": BarChart3,
  // Engineering
  "software-sprint": Code2,
  "engineering-capstone": Wrench,
  "technical-lab-report": FileText,
  // Basic Sciences
  "lab-experiment": FlaskConical,
  "research-thesis-science": Microscope,
  "data-analysis-project": LineChart,
  // Business
  "business-plan": Briefcase,
  "marketing-research": Target,
  "case-analysis": FileSearch,
  // Team
  "event-planning": PartyPopper,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, selectedId }) => {
  const [activeCategory, setActiveCategory] = useState<(typeof TEMPLATE_CATEGORIES)[number]>("All");

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "All") return ALL_TEMPLATES;
    return ALL_TEMPLATES.filter((template) => template.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all",
              activeCategory === category
                ? "bg-brand-primary text-white shadow-lg shadow-orange-500/20"
                : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-brand-primary"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredTemplates.map((template, index) => {
          const Icon = TEMPLATE_ICONS[template.id] || Sparkles;
          const isSelected = selectedId === template.id;

          return (
            <motion.button
              key={template.id}
              type="button"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect(template)}
              className={cn(
                "group relative flex flex-col rounded-[1.75rem] border p-5 text-left transition-all",
                isSelected
                  ? "border-brand-primary bg-brand-primary text-white shadow-2xl shadow-brand-primary/20"
                  : "border-slate-100 bg-slate-50/50 hover:border-brand-primary/30 hover:bg-white hover:shadow-xl"
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                    isSelected ? "bg-white/20 text-white" : "bg-white text-brand-primary shadow-sm"
                  )}
                >
                  <Icon size={22} />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                    isSelected ? "bg-white/15 text-white" : "bg-orange-50 text-brand-primary"
                  )}
                >
                  {template.category}
                </span>
              </div>

              <h4 className={cn("mb-2 text-base font-black", isSelected ? "text-white" : "text-slate-900")}>
                {template.name}
              </h4>

              <p className={cn("text-sm leading-relaxed", isSelected ? "text-orange-50" : "text-slate-600")}>
                {template.description}
              </p>

              {template.bestFor && (
                <p className={cn("mt-3 text-xs font-semibold", isSelected ? "text-orange-100" : "text-slate-500")}>
                  Best for: {template.bestFor}
                </p>
              )}

              <div
                className={cn(
                  "mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]",
                  isSelected ? "text-white" : "text-brand-primary"
                )}
              >
                <span>Select Blueprint</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
