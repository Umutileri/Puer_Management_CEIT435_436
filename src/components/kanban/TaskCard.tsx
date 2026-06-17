import React from "react";
import { Layout, CheckSquare, Users, BookOpen, Clock, Tag, ChevronRight, Plus, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Task } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";
import { motion } from "motion/react";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const isCompleted = task.isCompleted ?? task.completed ?? false;

  return (
    <motion.div
      layoutId={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onClick={() => onClick(task)}
      className={cn(
        "p-5 rounded-[1.5rem] border shadow-md hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group relative",
        isCompleted
          ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-300"
          : "bg-white border-slate-200 hover:border-brand-primary/40"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider",
                isCompleted
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-50 text-brand-primary"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-lg">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Done</span>
            </div>
          )}
          {task.assigneeId && (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-sm overflow-hidden">
               <Users size={12} className="text-slate-500" />
            </div>
          )}
        </div>
      </div>

      <h4 className={cn(
        "font-bold mb-4 leading-tight transition-colors",
        isCompleted
          ? "text-emerald-800/70 line-through"
          : "text-slate-900 group-hover:text-brand-primary"
      )}>{task.title}</h4>

      <div className="flex items-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-1">
            <CheckSquare size={13} className={cn(completedSubtasks === totalSubtasks && "text-emerald-500")} />
            <span className={cn(completedSubtasks === totalSubtasks && "text-emerald-600")}>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
        )}

        {task.deadline && (
          <div className="flex items-center gap-1">
            <Clock size={13} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="mt-4 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              isCompleted ? "bg-emerald-500" : "bg-brand-primary"
            )}
            style={{ width: `${(completedSubtasks / (totalSubtasks || 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Completed task without subtasks — show a full green bar */}
      {isCompleted && totalSubtasks === 0 && (
        <div className="mt-4 w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-full" />
        </div>
      )}
    </motion.div>
  );
};
