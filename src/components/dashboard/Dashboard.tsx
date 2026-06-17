import React, { useMemo, useState } from "react";
import {
  FolderKanban,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  CalendarClock,
  Activity,
  Bell,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Project, Task, Template } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";
import { TemplateSelector } from "../templates/TemplateSelector";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  currentUserName?: string;
  onCreateProject: (templateId: string, title: string) => void;
  onSelectProject: (projectId: string) => void;
  onNavigateToTask: (projectId: string, taskId: string) => void;
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  tasks,
  currentUserName,
  onCreateProject,
  onSelectProject,
  onNavigateToTask,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleCreate = () => {
    if (!newProjectTitle || !selectedTemplate) return;
    onCreateProject(selectedTemplate.id, newProjectTitle);
    setIsCreating(false);
    setNewProjectTitle("");
    setSelectedTemplate(null);
  };

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const isTaskCompleted = (task: Task) => {
    return task.isCompleted ?? task.completed ?? false;
  };

  const completedTaskCount = tasks.filter(isTaskCompleted).length;
  const totalTaskCount = tasks.length;
  const weeklyCompletedTaskCount = tasks.filter((task) => {
    const createdTime = new Date(task.createdAt).getTime();
    const last7Days = Date.now() - 7 * MS_IN_DAY;
    return isTaskCompleted(task) && createdTime >= last7Days;
  }).length;

  const lastTask = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const lastActiveProject =
    (lastTask ? projectById.get(lastTask.projectId) : undefined) ??
    [...projects].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const lastProjectTasks = lastActiveProject
    ? tasks.filter((task) => task.projectId === lastActiveProject.id)
    : [];
  const lastProjectCompletedCount = lastProjectTasks.filter(isTaskCompleted).length;
  const lastProjectProgress = lastProjectTasks.length
    ? Math.round((lastProjectCompletedCount / lastProjectTasks.length) * 100)
    : 0;

  const upcomingDeadlines = [...tasks]
    .filter((task) => task.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  const recentActivities = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <header className="bento-card px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Team Overview</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">
            Welcome back{currentUserName ? `, ${currentUserName}` : ""}
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Open project details from the Projects page.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-brand-primary/20"
        >
          <FolderPlus size={18} />
          <span>New Project</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bento-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-brand-primary">
            <FolderKanban size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{projects.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Projects</p>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {completedTaskCount}/{totalTaskCount}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tasks Completed</p>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <CalendarClock size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{upcomingDeadlines.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Deadlines</p>
          </div>
        </div>

        <div className="bento-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{weeklyCompletedTaskCount}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weekly Tasks Done</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="bento-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ListTodo size={18} className="text-brand-accent" />
              Project Progress
            </h3>
            {lastActiveProject && (
              <button
                onClick={() => onSelectProject(lastActiveProject.id)}
                className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
              >
                Open Project <ArrowRight size={14} />
              </button>
            )}
          </div>

          {!lastActiveProject ? (
            <p className="text-sm text-slate-500">No project selected</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{lastActiveProject.title}</p>
                <p className="text-xs text-slate-500">Last active project progress</p>
              </div>
              <div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-500"
                    style={{ width: `${lastProjectProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">
                    {lastProjectCompletedCount}/{lastProjectTasks.length} tasks completed
                  </span>
                  <span className="text-brand-primary">{lastProjectProgress}%</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bento-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-emerald-600" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-500">No milestones yet</p>
            ) : (
              upcomingDeadlines.map((task) => {
                const taskProject = projectById.get(task.projectId);
                return (
                  <button
                    key={task.id}
                    onClick={() => onNavigateToTask(task.projectId, task.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-brand-primary/40 hover:bg-orange-50/40 transition-colors"
                  >
                    <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{taskProject?.title ?? "Unknown Project"}</p>
                    <p className="text-[11px] text-brand-primary font-bold mt-1">{formatDate(task.deadline!)}</p>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="bento-card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-brand-accent" />
          Recent Group Activity
        </h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity. Create a project and add tasks to get started.</p>
          ) : (
            recentActivities.map((task) => {
              const taskProject = projectById.get(task.projectId);
              const actor = task.assigneeId || taskProject?.ownerId || "Team member";
              const completedNow = isTaskCompleted(task);
              const action = completedNow ? "completed a task" : "added a task";

              return (
                <button
                  key={task.id}
                  onClick={() => onNavigateToTask(task.projectId, task.id)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900">{actor}</span> {action} in{" "}
                    <span className="font-bold text-brand-primary">{taskProject?.title ?? "Unknown Project"}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {task.title} • {formatDate(task.createdAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </section>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId="create-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 md:p-12 kanban-scrollbar"
            >
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Design Your Workflow</h2>
                <p className="text-slate-600 text-center mb-10">
                  Choose a general or education template. Each blueprint includes clearer descriptions and starter tasks.
                </p>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Project Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. CEIT 436 Group Project"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full text-2xl font-bold bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent rounded-2xl p-4 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Blueprint</label>
                    <TemplateSelector selectedId={selectedTemplate?.id} onSelect={setSelectedTemplate} />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!newProjectTitle || !selectedTemplate}
                      onClick={handleCreate}
                  className={cn(
                    "flex-[2] py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-xl",
                    !newProjectTitle || !selectedTemplate
                      ? "bg-slate-200 cursor-not-allowed shadow-none"
                      : "bg-brand-accent hover:bg-orange-600 shadow-brand-accent/30 active:scale-[0.98]"
                  )}
                    >
                      Initialize Project
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
