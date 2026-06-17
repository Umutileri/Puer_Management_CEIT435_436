import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Project, Task, Column } from "@/src/types";
import { KanbanColumn } from "./Column";
import { TaskCard } from "./TaskCard";
import { createPortal } from "react-dom";

interface BoardProps {
  project: Project;
  tasks: Task[];
  canEdit: boolean;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

export const KanbanBoard: React.FC<BoardProps> = ({ project, tasks, canEdit, onTaskMove, onAddTask, onTaskClick }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle moving tasks between columns
    const activeTask = tasks.find((t) => t.id === activeId);
    const overColumn = project.columns.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    if (activeTask && overColumn && activeTask.columnId !== overColumn.id) {
      onTaskMove(activeId as string, overColumn.id);
    } else if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
      onTaskMove(activeId as string, overTask.columnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="bento-card bg-white p-8 flex-1 flex flex-col min-h-0">
          <div className="flex gap-8 h-full overflow-x-auto pb-4 kanban-scrollbar scroll-smooth">
            <SortableContext items={project.columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              {project.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasks.filter((t) => t.columnId === column.id)}
                  canEdit={canEdit}
                  onTaskClick={onTaskClick}
                  onAddTask={onAddTask}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask ? (
              <div className="w-80 opacity-80 rotate-3">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};
