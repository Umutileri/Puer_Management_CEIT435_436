import React, { useEffect, useMemo, useState } from "react";
import { Project, Task } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";
import { UserAvatar } from "@/src/components/layout/UserAvatar";
import { Star, TrendingUp, Users, Eye, EyeOff, MessageSquare, Clock, Send, AlertCircle, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/src/lib/utils";
import { canSubmitEvaluations } from "@/src/lib/permissions";

interface EvaluationsProps {
  projects: Project[];
  tasks: Task[];
}

type EvaluationMode = "identified" | "anonymous";

interface MemberInfo {
  email: string;
  name: string;
  role: string;
  points: number;
  isCurrentUser: boolean;
}

interface SharedEvaluation {
  id: string;
  projectId: string;
  evaluatorEmail: string;
  evaluatorName: string;
  targetEmail: string;
  targetName: string;
  score: number;
  comment: string;
  mode: "identified" | "anonymous";
  createdAt: string;
}

export const Evaluations: React.FC<EvaluationsProps> = ({ projects, tasks }) => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("identified");
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { name: string; role: string }>>({});
  const [sharedEvaluations, setSharedEvaluations] = useState<SharedEvaluation[]>([]);

  // --- Single evaluation form state ---
  const [formTarget, setFormTarget] = useState<string>("");
  const [formRating, setFormRating] = useState<number>(0);
  const [formComment, setFormComment] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{ target?: string; rating?: string; comment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEvaluations, setExistingEvaluations] = useState<Record<string, { score: number; comment: string }>>({});

  // --- Shared responses filter ---
  const [responsesFilterEmail, setResponsesFilterEmail] = useState<string>("");

  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId("");
    }
  }, [projects, selectedProjectId]);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Reset form when project changes
  useEffect(() => {
    setFormTarget("");
    setFormRating(0);
    setFormComment("");
    setFormErrors({});
    setResponsesFilterEmail("");
  }, [selectedProjectId]);

  // Fetch user's existing evaluations for this project (for pre-populating form)
  useEffect(() => {
    if (!selectedProjectId || !user?.email) return;

    fetch(`/api/evaluations?projectId=${encodeURIComponent(selectedProjectId)}&email=${encodeURIComponent(user.email)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        const existing: Record<string, { score: number; comment: string }> = {};
        items.forEach((item: any) => {
          if (item.evaluatorEmail === user.email) {
            existing[item.targetEmail] = { score: item.score, comment: item.comment || "" };
            if (item.mode) setEvaluationMode(item.mode);
          }
        });
        setExistingEvaluations(existing);
      })
      .catch(() => undefined);
  }, [selectedProjectId, user?.email]);

  // Fetch all shared evaluations for the project
  useEffect(() => {
    if (!selectedProjectId) {
      setSharedEvaluations([]);
      return;
    }
    fetchSharedEvaluations();
  }, [selectedProjectId]);

  const fetchSharedEvaluations = () => {
    if (!selectedProjectId) return;
    fetch(`/api/evaluations?projectId=${encodeURIComponent(selectedProjectId)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((items: any[]) => {
        // Deduplicate evaluations: keep only the latest per reviewer->target pair
        const uniqueItemsMap = new Map<string, any>();
        items.forEach((e) => {
          const key = `${e.projectId}-${e.evaluatorEmail}-${e.targetEmail}`;
          // Keep the newest one by comparing createdAt
          if (!uniqueItemsMap.has(key) || new Date(e.createdAt) > new Date(uniqueItemsMap.get(key).createdAt)) {
            uniqueItemsMap.set(key, e);
          }
        });
        
        const mapped = Array.from(uniqueItemsMap.values()).map((e) => {
          return {
            id: e.id,
            projectId: e.projectId,
            evaluatorEmail: e.mode === "anonymous" ? "anonymous" : e.evaluatorEmail,
            evaluatorName: e.mode === "anonymous" ? "Anonymous" : (memberProfiles[e.evaluatorEmail]?.name || e.evaluatorEmail.split("@")[0]),
            targetEmail: e.targetEmail,
            targetName: memberProfiles[e.targetEmail]?.name || e.targetEmail.split("@")[0],
            score: e.score,
            comment: e.comment || "",
            mode: e.mode,
            createdAt: e.createdAt,
          } as SharedEvaluation;
        });
        setSharedEvaluations(mapped);
      })
      .catch(() => setSharedEvaluations([]));
  };

  const isTaskCompleted = (task: Task) => {
    return task.isCompleted ?? task.completed ?? false;
  };

  const contributionData = useMemo<MemberInfo[]>(() => {
    if (!currentProject) return [];

    const members = [{ email: currentProject.ownerId, role: "owner" }, ...currentProject.members];
    const uniqueMembers = Array.from(new Map(members.map((item) => [item.email, item])).values());
    const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);

    return uniqueMembers
      .map((member) => {
        const assignedTasks = projectTasks.filter((task) => task.assigneeId === member.email);
        // Award completion points ONLY when completedByUserId matches this member.
        // Never use the owner as a fallback. Never infer from column position.
        const completedTasks = projectTasks.filter(
          (task) =>
            isTaskCompleted(task) &&
            task.completedByUserId === member.email
        );
        const points = completedTasks.length * 20 + assignedTasks.length * 5;

        return {
          email: member.email,
          name: memberProfiles[member.email]?.name || member.email.split("@")[0],
          role: memberProfiles[member.email]?.role || member.role,
          points,
          isCurrentUser: member.email === user?.email,
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [currentProject, tasks, user, memberProfiles]);

  useEffect(() => {
    if (!currentProject) return;

    const emails = [currentProject.ownerId, ...currentProject.members.map((member) => member.email)];

    Promise.all(
      emails.map(async (email) => {
        try {
          const res = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`);
          if (!res.ok) return [email, { name: email.split("@")[0], role: "" }] as const;
          const profile = await res.json();
          return [email, { name: profile.name, role: profile.role }] as const;
        } catch {
          return [email, { name: email.split("@")[0], role: "" }] as const;
        }
      })
    ).then((entries) => {
      setMemberProfiles(Object.fromEntries(entries));
    });
  }, [currentProject]);

  // Pre-populate form when selecting a teammate you've already evaluated
  useEffect(() => {
    if (formTarget && existingEvaluations[formTarget]) {
      setFormRating(existingEvaluations[formTarget].score);
      setFormComment(existingEvaluations[formTarget].comment);
    } else {
      setFormRating(0);
      setFormComment("");
    }
    setFormErrors({});
  }, [formTarget]);

  const teammates = contributionData.filter((m) => !m.isCurrentUser);
  const canSubmit = canSubmitEvaluations(user, currentProject);

  const handleSubmitEvaluation = async () => {
    if (!canSubmit) {
      toast.error("Viewers cannot submit peer evaluations.");
      return;
    }

    const errors: typeof formErrors = {};
    if (!formTarget) errors.target = "Please select a teammate.";
    if (!formRating) errors.rating = "Please select a rating.";
    if (!formComment.trim()) errors.comment = "Please write a comment before submitting.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!user?.email || !currentProject) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          evaluatorEmail: user.email,
          targetEmail: formTarget,
          score: formRating,
          comment: formComment.trim(),
          mode: evaluationMode,
        }),
      });

      if (!response.ok) throw new Error("Failed to save evaluation");

      const isUpdate = !!existingEvaluations[formTarget];
      toast.success(isUpdate ? "Evaluation updated!" : "Evaluation submitted!");

      // Update local existing evaluations cache
      setExistingEvaluations((prev) => ({
        ...prev,
        [formTarget]: { score: formRating, comment: formComment.trim() },
      }));

      // Automatically switch the response filter to the evaluated teammate so it appears immediately
      setResponsesFilterEmail(formTarget);

      // Reset form
      setFormTarget("");
      setFormRating(0);
      setFormComment("");
      setFormErrors({});

      // Refresh shared evaluations
      fetchSharedEvaluations();
    } catch {
      toast.error("Could not save evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEvalDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return "";
    }
  };

  // --- Filtered responses for selected teammate ---
  const filteredResponses = responsesFilterEmail
    ? sharedEvaluations.filter((e) => e.targetEmail === responsesFilterEmail)
    : [];

  const filteredAverage = filteredResponses.length > 0
    ? (filteredResponses.reduce((sum, e) => sum + e.score, 0) / filteredResponses.length).toFixed(1)
    : null;

  const filteredTargetName = responsesFilterEmail
    ? (memberProfiles[responsesFilterEmail]?.name || responsesFilterEmail.split("@")[0])
    : "";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 w-full p-2">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-[0.2em]">
            Performance Review
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Team Evaluations</h1>
          <p className="text-slate-600 font-medium">Review your peers and analyze contribution metrics.</p>
        </div>

        {projects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </header>

      {!currentProject ? (
        <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Projects Found</h3>
          <p className="text-slate-600">You need to be part of a project to evaluate team members.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top grid: Chart + Evaluation Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Contribution Chart */}
            <div className="col-span-1 lg:col-span-7 space-y-6 flex flex-col">
              <div className="bento-card p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp size={20} className="text-orange-500" />
                      Contribution Analysis
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      Based on completed and assigned tasks
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      />
                      <Bar dataKey="points" radius={[6, 6, 0, 0]} maxBarSize={60}>
                        {contributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isCurrentUser ? "#f97316" : "#cbd5e1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right column: Mode + Evaluation Form */}
            <div className="col-span-1 lg:col-span-5 space-y-4">
              {/* Evaluation Mode */}
              <div className="bento-card p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary mb-3">
                  Evaluation Mode
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEvaluationMode("identified")}
                    className={cn(
                      "rounded-2xl border p-3 text-left transition-all",
                      evaluationMode === "identified"
                        ? "border-brand-primary bg-orange-50 shadow-lg shadow-orange-500/10"
                        : "border-slate-200 bg-white hover:border-orange-200"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 font-black text-slate-900 text-sm">
                      <Eye size={16} className="text-brand-primary" />
                      Identified
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">
                      Your name is visible to teammates.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationMode("anonymous")}
                    className={cn(
                      "rounded-2xl border p-3 text-left transition-all",
                      evaluationMode === "anonymous"
                        ? "border-brand-primary bg-orange-50 shadow-lg shadow-orange-500/10"
                        : "border-slate-200 bg-white hover:border-orange-200"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 font-black text-slate-900 text-sm">
                      <EyeOff size={16} className="text-brand-primary" />
                      Anonymous
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">
                      Submit without revealing identity.
                    </p>
                  </button>
                </div>
              </div>

              {/* Single Evaluation Form */}
              <div className="bento-card p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Send size={18} className="text-orange-500" />
                  Submit Peer Review
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-5">
                  Mode: {evaluationMode === "anonymous" ? "Anonymous" : "Identified"}
                </p>

                {!canSubmit ? (
                  <div className="text-center p-6 text-slate-500 italic text-sm">
                    Only Editors and Owners can submit peer evaluations.
                  </div>
                ) : teammates.length === 0 ? (
                  <div className="text-center p-6 text-slate-500 italic text-sm">
                    No other team members to evaluate in this project.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Teammate Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Select Teammate
                      </label>
                      <div className="relative">
                        <select
                          value={formTarget}
                          onChange={(e) => setFormTarget(e.target.value)}
                          className={cn(
                            "w-full bg-white border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all appearance-none pr-10",
                            formErrors.target ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20" : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          )}
                        >
                          <option value="">— Choose a teammate —</option>
                          {teammates.map((m) => (
                            <option key={m.email} value={m.email}>
                              {m.name} {existingEvaluations[m.email] ? "✓" : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      {formErrors.target && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.target}
                        </p>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => { setFormRating(score); setFormErrors((p) => ({ ...p, rating: undefined })); }}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-1",
                              formRating >= score
                                ? "bg-orange-100 text-orange-600 shadow-sm"
                                : "bg-white text-slate-400 border border-slate-200 hover:border-orange-300 hover:text-orange-400"
                            )}
                          >
                            <Star
                              size={16}
                              className={formRating >= score ? "fill-orange-500 text-orange-500" : ""}
                            />
                          </button>
                        ))}
                      </div>
                      {formErrors.rating && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.rating}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Comment
                      </label>
                      <textarea
                        value={formComment}
                        onChange={(e) => { setFormComment(e.target.value); setFormErrors((p) => ({ ...p, comment: undefined })); }}
                        placeholder="Write your feedback..."
                        className={cn(
                          "w-full border rounded-xl px-4 py-3 text-sm text-slate-700 outline-none transition-all resize-none min-h-[90px]",
                          formErrors.comment ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20" : "bg-white border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        )}
                      />
                      {formErrors.comment && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.comment}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmitEvaluation}
                      disabled={isSubmitting}
                      className={cn(
                        "w-full py-3 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2",
                        isSubmitting
                          ? "bg-slate-300 cursor-not-allowed shadow-none"
                          : "bg-brand-primary hover:bg-orange-600 shadow-brand-primary/20 active:scale-[0.98]"
                      )}
                    >
                      <Send size={16} />
                      {isSubmitting
                        ? "Submitting..."
                        : formTarget && existingEvaluations[formTarget]
                          ? "Update Evaluation"
                          : "Submit Evaluation"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shared Evaluation Responses Section */}
          <div className="bento-card p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={20} className="text-orange-500" />
                  Team Evaluation Responses
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Filter by teammate to view their evaluations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                  {sharedEvaluations.length} total
                </span>
                <div className="relative">
                  <select
                    value={responsesFilterEmail}
                    onChange={(e) => setResponsesFilterEmail(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none pr-10 min-w-[180px]"
                  >
                    <option value="">Select teammate</option>
                    {contributionData.map((m) => (
                      <option key={m.email} value={m.email}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {!responsesFilterEmail ? (
              /* No teammate selected */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Users size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Select a teammate to view their evaluations.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a team member from the dropdown above.
                </p>
              </div>
            ) : filteredResponses.length === 0 ? (
              /* Teammate selected but no evaluations */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <MessageSquare size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  No evaluations have been submitted for {filteredTargetName} yet.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <UserAvatar name={filteredTargetName} size="lg" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">{filteredTargetName}</p>
                    <p className="text-xs text-slate-500 font-semibold">{filteredResponses.length} {filteredResponses.length === 1 ? "review" : "reviews"} received</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={cn(
                            s <= Math.round(Number(filteredAverage))
                              ? "fill-orange-400 text-orange-400"
                              : "text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-black text-slate-900">{filteredAverage}</span>
                    <span className="text-xs font-bold text-slate-400">/5</span>
                  </div>
                </div>

                {/* Individual Response Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredResponses.map((evaluation) => (
                    <motion.div
                      key={evaluation.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
                    >
                      {/* Reviewer */}
                      <div className="flex items-center gap-3 mb-3">
                        {evaluation.mode === "anonymous" ? (
                          <div className="flex shrink-0 items-center justify-center rounded-full w-9 h-9 bg-slate-200 text-slate-500 text-xs font-black">
                            <EyeOff size={16} />
                          </div>
                        ) : (
                          <UserAvatar name={evaluation.evaluatorName} size="md" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm truncate">
                              {evaluation.mode === "anonymous" ? "Anonymous" : evaluation.evaluatorName}
                            </p>
                            {evaluation.mode === "anonymous" && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Reviewer
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={cn(
                              "transition-colors",
                              s <= evaluation.score
                                ? "fill-orange-400 text-orange-400"
                                : "text-slate-200"
                            )}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-500 ml-1">{evaluation.score}/5</span>
                      </div>

                      {/* Comment */}
                      {evaluation.comment && (
                        <div className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 mb-3">
                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            "{evaluation.comment}"
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      {evaluation.createdAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                          <Clock size={10} />
                          {formatEvalDate(evaluation.createdAt)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
