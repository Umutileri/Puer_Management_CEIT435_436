import React from "react";
import { Column, Task } from "@/src/types";
import { TaskCard } from "./TaskCard";
import { Plus, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/src/lib/utils";

interface ColumnProps {
  column: Column;
  tasks: Task[];
  canEdit: boolean;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

export const KanbanColumn: React.FC<ColumnProps> = ({ column, tasks, canEdit, onTaskClick, onAddTask }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: !canEdit,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col w-[300px] min-w-[300px] h-full transition-all",
        isDragging && "opacity-50"
      )}
    >
      <div className="p-4 flex items-center justify-between mb-2" {...(canEdit ? attributes : {})} {...(canEdit ? listeners : {})}>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[11px] uppercase tracking-[0.1em] text-slate-700">
            {column.title}
          </h3>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-4 kanban-scrollbar mb-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
        {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-500 text-xs italic">
              Empty Section
            </div>
        )}
      </div>

      {canEdit && (
        <button
          onClick={() => onAddTask(column.id)}
          className="mx-1 py-3.5 flex items-center justify-center gap-2 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-primary/30 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider group shadow-sm hover:shadow-md"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          <span>Add Activity</span>
        </button>
      )}
    </div>
  );
};
