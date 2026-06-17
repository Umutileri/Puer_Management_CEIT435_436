import React, { useState } from "react";
import { Task, Subtask } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { X, AlignLeft, CheckCircle2, Circle, Plus, Trash2, UserPlus, Calendar, Check } from "lucide-react";
import { cn, formatDate } from "@/src/lib/utils";

interface TaskModalProps {
  task: Task;
  canEdit?: boolean;
  currentUserId?: string;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, canEdit = true, currentUserId, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [newSubtask, setNewSubtask] = useState("");
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [memberStr, setMemberStr] = useState(task.assigneeId || "");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagStr, setNewTagStr] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCompleted = task.isCompleted ?? task.completed ?? false;
  const allSubtasksDone = task.subtasks.length > 0 && task.subtasks.every((s) => s.completed);

  const handleToggleComplete = () => {
    if (!isCompleted) {
      // Mark as completed
      onUpdate(task.id, {
        completed: true,
        isCompleted: true,
        completedByUserId: currentUserId || null,
        completedAt: new Date().toISOString(),
      });
    } else {
      // Reopen — clear completion metadata
      onUpdate(task.id, {
        completed: false,
        isCompleted: false,
        completedByUserId: null,
        completedAt: null,
      });
    }
  };

  const handleUpdateSubtask = (subtaskId: string, completed: boolean) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed } : s
    );
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: Math.random().toString(36).substring(7),
      title: newSubtask,
      completed: false,
    };
    onUpdate(task.id, { subtasks: [...task.subtasks, subtask] });
    setNewSubtask("");
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    onUpdate(task.id, { subtasks: task.subtasks.filter(s => s.id !== subtaskId) });
  };

  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 md:p-8 flex items-start justify-between border-b border-slate-100">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              disabled={!canEdit}
              onChange={(e) => {
                setTitle(e.target.value);
                onUpdate(task.id, { title: e.target.value });
              }}
              className={cn(
                "w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0",
                isCompleted ? "text-slate-400 line-through" : "text-slate-800"
              )}
            />
            <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs font-medium uppercase tracking-widest">
              <span>Section: In Progress</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Created {formatDate(task.createdAt)}</span>
              {isCompleted && (
                <>
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-600 font-bold">Completed</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 kanban-scrollbar">
          {/* Task Completion Toggle */}
          {canEdit && (
            <div>
              <button
                onClick={handleToggleComplete}
                className={cn(
                  "w-full py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                  isCompleted
                    ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border-2 border-dashed border-slate-200 hover:border-brand-primary hover:text-brand-primary hover:bg-orange-50"
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Completed — Click to Mark Incomplete</span>
                  </>
                ) : (
                  <>
                    <Circle size={18} />
                    <span>Mark Task as Complete</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Members & Tags */}
          <div className="flex flex-wrap gap-8">
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignees</h5>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                   <UserPlus size={16} className="text-slate-500" />
                </div>
                {isEditingMember && canEdit ? (
                  <input
                    autoFocus
                    value={memberStr}
                    onChange={(e) => setMemberStr(e.target.value)}
                    onBlur={() => {
                      setIsEditingMember(false);
                      if (memberStr !== task.assigneeId) {
                        onUpdate(task.id, { assigneeId: memberStr.trim() || undefined });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingMember(false);
                        if (memberStr !== task.assigneeId) {
                          onUpdate(task.id, { assigneeId: memberStr.trim() || undefined });
                        }
                      }
                      if (e.key === "Escape") setIsEditingMember(false);
                    }}
                    className="w-24 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none"
                    placeholder="Email/Name"
                  />
                ) : (
                  <button 
                    onClick={() => canEdit && setIsEditingMember(true)}
                    className={cn("text-[10px] font-bold", canEdit ? "text-brand-accent hover:underline" : "text-slate-600 cursor-default")}
                  >
                    {task.assigneeId ? task.assigneeId : (canEdit ? "Add Member" : "Unassigned")}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags</h5>
              <div className="flex items-center gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
                {isAddingTag && canEdit ? (
                  <input
                    autoFocus
                    value={newTagStr}
                    onChange={(e) => setNewTagStr(e.target.value)}
                    onBlur={() => {
                      setIsAddingTag(false);
                      if (newTagStr.trim() && !task.tags.includes(newTagStr.trim())) {
                        onUpdate(task.id, { tags: [...task.tags, newTagStr.trim()] });
                      }
                      setNewTagStr("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsAddingTag(false);
                        if (newTagStr.trim() && !task.tags.includes(newTagStr.trim())) {
                          onUpdate(task.id, { tags: [...task.tags, newTagStr.trim()] });
                        }
                        setNewTagStr("");
                      }
                      if (e.key === "Escape") setIsAddingTag(false);
                    }}
                    className="w-16 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none uppercase"
                    placeholder="TAG"
                  />
                ) : (
                  canEdit && (
                    <button 
                      onClick={() => setIsAddingTag(true)}
                      className="p-1 text-slate-500 hover:text-brand-accent"
                    >
                      <Plus size={14} />
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</h5>
              <div className="relative flex items-center bg-slate-50 rounded-lg px-3 py-1">
                <Calendar size={14} className="text-brand-accent mr-2" />
                <input 
                  type="date"
                  disabled={!canEdit}
                  value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdate(task.id, { deadline: new Date(e.target.value).toISOString() });
                    } else {
                      onUpdate(task.id, { deadline: undefined });
                    }
                  }}
                  className={cn("bg-transparent text-slate-700 text-xs outline-none w-24", canEdit ? "cursor-pointer" : "cursor-default")}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <AlignLeft size={18} />
              <span>Description</span>
            </div>
            <textarea
              placeholder={canEdit ? "Add details for this task..." : "No description provided."}
              value={description}
              disabled={!canEdit}
              onChange={(e) => {
                setDescription(e.target.value);
                onUpdate(task.id, { description: e.target.value });
              }}
              className="w-full min-h-[120px] bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent/30 rounded-2xl p-4 text-slate-700 outline-none transition-all resize-none"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Deliverables & Subtasks</span>
              </div>
              <div className="text-xs text-slate-500 font-bold">
                {subtaskProgress}%
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${subtaskProgress}%` }}
              />
            </div>

            <div className="space-y-1">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 group px-2 py-1 rounded-lg hover:bg-slate-50 transition-all">
                  <button onClick={() => canEdit && handleUpdateSubtask(subtask.id, !subtask.completed)} disabled={!canEdit}>
                    {subtask.completed ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className="text-slate-400" />
                    )}
                  </button>
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.completed ? "line-through text-slate-500" : "text-slate-700"
                  )}>
                    {subtask.title}
                  </span>
                  {canEdit && (
                    <button 
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="flex items-center gap-3 pt-2">
                <div className="p-1">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canEdit && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-500">Delete forever?</span>
                  <button 
                    onClick={() => {
                      if (onDelete) onDelete();
                    }}
                    className="px-3 py-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Delete
                </button>
              )
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-brand-primary/10"
          >
            {canEdit ? "All Changes Saved" : "Close"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
