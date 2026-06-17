/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskId = string;
export type ColumnId = string;
export type ProjectId = string;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: TaskId;
  projectId: ProjectId;
  columnId: ColumnId;
  title: string;
  description?: string;
  deadline?: string; // ISO format
  tags: string[];
  subtasks: Subtask[];
  assigneeId?: string;
  /** @deprecated Use isCompleted instead */
  completed?: boolean;
  isCompleted: boolean;
  completedByUserId: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  order: number;
}

export interface ProjectMember {
  email: string;
  role: 'editor' | 'viewer';
}

export interface Project {
  id: ProjectId;
  title: string;
  description: string;
  ownerId: string;
  members: ProjectMember[];

  columns: Column[];
  templateId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface PeerEvaluation {
  id: string;
  projectId: string;
  evaluatorEmail: string;
  targetEmail: string;
  score: number;
  comment?: string;
  mode: "identified" | "anonymous";
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  bestFor?: string;
  category: "Education" | "General" | "Team" | "CEIT" | "Engineering" | "Basic Sciences" | "Business";
  columns: string[];
  initialTasks: { title: string; description?: string; tags: string[]; column?: number }[];
}
