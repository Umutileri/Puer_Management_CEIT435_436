import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { Project, Task } from "@/src/types";
import { formatDate, cn } from "@/src/lib/utils";

interface CalendarPageProps {
  projects: Project[];
  tasks: Task[];
  onNavigateToTask: (projectId: string, taskId: string) => void;
}

const dayKey = (dateStr: string) => {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const getCellKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const CalendarPage: React.FC<CalendarPageProps> = ({ projects, tasks, onNavigateToTask }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Group tasks by their deadline key (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.deadline) {
        const key = dayKey(task.deadline);
        if (key) {
          const current = map.get(key) ?? [];
          current.push(task);
          map.set(key, current);
        }
      }
    });
    return map;
  }, [tasks]);

  const groupedDeadlines = useMemo(() => {
    const deadlineTasks = tasks
      .filter((task) => task.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    const groups = new Map<string, Task[]>();
    deadlineTasks.forEach((task) => {
      const key = dayKey(task.deadline!);
      if (key) {
        const current = groups.get(key) ?? [];
        current.push(task);
        groups.set(key, current);
      }
    });

    return Array.from(groups.entries());
  }, [tasks]);

  const displayDeadlines = useMemo(() => {
    if (!selectedDateKey) return groupedDeadlines;
    return groupedDeadlines.filter(([date]) => date === selectedDateKey);
  }, [groupedDeadlines, selectedDateKey]);

  // Calendar logic helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = useMemo(() => {
    const list: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      list.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      list.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const totalCells = list.length > 35 ? 42 : 35;
    const remaining = totalCells - list.length;
    for (let i = 1; i <= remaining; i++) {
      list.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return list;
  }, [year, month, firstDayIndex, daysInMonth, prevMonthDays]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <header className="bento-card px-8 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Calendar</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">Task Schedule</h1>
        <p className="text-slate-600 mt-1 font-medium">
          See which tasks are due each day and open them directly in the project board.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        {/* Left Column: Calendar Month View */}
        <section className="bento-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="text-brand-primary" size={20} />
              <span className="capitalize">
                {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDateKey(null);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 mb-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {cells.map((cell, idx) => {
              const cellKey = getCellKey(cell.date);
              const cellTasks = tasksByDate.get(cellKey) || [];
              const isSelected = selectedDateKey === cellKey;
              const isCurrentDay = isToday(cell.date);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDateKey(selectedDateKey === cellKey ? null : cellKey);
                  }}
                  className={cn(
                    "aspect-square rounded-xl sm:rounded-2xl flex flex-col justify-between p-1.5 sm:p-2.5 border transition-all text-left relative group/cell",
                    cell.isCurrentMonth
                      ? "bg-white border-slate-100 hover:border-brand-primary/40 hover:shadow-md"
                      : "bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-slate-100/50",
                    isCurrentDay && "ring-2 ring-brand-primary/20 border-brand-primary/40",
                    isSelected &&
                      "bg-gradient-to-br from-brand-primary to-orange-400 border-transparent text-white hover:shadow-lg shadow-orange-500/20"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-white" : cell.isCurrentMonth ? "text-slate-800" : "text-slate-400"
                    )}
                  >
                    {cell.date.getDate()}
                  </span>

                  {cellTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {isSelected ? (
                        <span className="text-[9px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                          {cellTasks.length} {cellTasks.length === 1 ? "task" : "tasks"}
                        </span>
                      ) : (
                        <div className="flex gap-0.5 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                          {cellTasks.length > 1 && (
                            <span className="text-[8px] font-black text-brand-primary bg-orange-50 px-1 rounded-sm">
                              +{cellTasks.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Column: Deadlines List */}
        <section className="bento-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock3 size={18} className="text-brand-primary" />
              <span>
                {selectedDateKey ? `Due on ${formatDate(selectedDateKey)}` : "All Scheduled Tasks"}
              </span>
            </h3>
            {selectedDateKey && (
              <button
                onClick={() => setSelectedDateKey(null)}
                className="text-xs font-bold text-brand-primary hover:text-slate-800 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>

          {displayDeadlines.length === 0 ? (
            <div className="text-center py-16 my-auto">
              <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                {selectedDateKey ? "No tasks due on this date." : "No scheduled task deadlines yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {displayDeadlines.map(([date, dayTasks]) => (
                <div key={date} className="border border-slate-150 rounded-2xl p-4 bg-white/40">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={14} className="text-brand-primary" />
                    <h3 className="text-sm font-bold text-slate-900">{formatDate(date)}</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.map((task) => {
                      const project = projectById.get(task.projectId);
                      return (
                        <button
                          key={task.id}
                          onClick={() => onNavigateToTask(task.projectId, task.id)}
                          className="w-full text-left p-3.5 rounded-xl border border-slate-100 bg-white hover:border-brand-primary/45 hover:shadow-sm transition-all"
                        >
                          <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-xs text-slate-500 truncate max-w-[150px]">
                              {project?.title ?? "Unknown Project"}
                            </span>
                            <span className="text-[10px] text-brand-primary font-black bg-orange-50 px-2 py-0.5 rounded-md">
                              Open Board
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
