import { useState, useEffect } from "react";
import { Project, Task } from "../types";
import { generateId } from "../lib/utils";
import { ALL_TEMPLATES, getTemplateById } from "../constants";
import { useAuth } from "../context/AuthContext";

export function usePersistence() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const projRes = await fetch(`/api/projects?email=${encodeURIComponent(user.email)}`);
        const projData = await projRes.json();
        setProjects(projData);

        const tasksRes = await fetch(`/api/tasks?email=${encodeURIComponent(user.email)}`);
        const tasksData = await tasksRes.json();
        // Normalize old persisted tasks: ensure explicit completion fields exist
        const normalizedTasks = tasksData.map((t: any) => ({
          ...t,
          isCompleted: t.isCompleted ?? t.completed ?? false,
          completedByUserId: t.completedByUserId ?? null,
          completedAt: t.completedAt ?? null,
        }));
        setTasks(normalizedTasks);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const createProjectFromTemplate = async (templateId: string, title: string) => {
    const template = getTemplateById(templateId) || ALL_TEMPLATES[0];
    
    const projectId = generateId();
    const columns = template.columns.map((colName, index) => ({
      id: generateId(),
      title: colName,
      order: index,
    }));

    const newProject: Project = {
      id: projectId,
      title,
      description: template.description,
      ownerId: user?.email || "me",
      members: [],
      columns,
      templateId,
      createdAt: new Date().toISOString(),
    };

    const initialTasks: Task[] = template.initialTasks.map((t) => ({
      id: generateId(),
      projectId,
      columnId: columns[t.column ?? 0]?.id || columns[0].id,
      title: t.title,
      description: t.description,
      tags: t.tags,
      subtasks: [],
      isCompleted: false,
      completedByUserId: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    }));

    // Save to backend
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });

    for (const task of initialTasks) {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
    }

    setProjects((prev) => [...prev, newProject]);
    setTasks((prev) => [...prev, ...initialTasks]);
    return projectId;
  };

  const updateTaskColumn = async (taskId: string, newColumnId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: newColumnId } : t))
    );
    
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: newColumnId }),
    });
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "isCompleted" | "completedByUserId" | "completedAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      isCompleted: false,
      completedByUserId: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const projectToUpdate = projects.find((p) => p.id === id);
    if (!projectToUpdate) return;
    
    const updatedProject = { ...projectToUpdate, ...updates };
    setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
    
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    });
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const loadProjectTasks = async (projectId: string) => {
    // No-op: tasks are now loaded globally in fetchData
  };

  return {
    projects,
    tasks,
    loading,
    createProjectFromTemplate,
    updateTaskColumn,
    addTask,
    updateTask,
    updateProject,
    deleteProject,
    deleteTask,
    loadProjectTasks
  };
}
