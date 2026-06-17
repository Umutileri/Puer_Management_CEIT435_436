import { Project, UserProfile } from "@/src/types";

export const getProjectRole = (user: UserProfile | null | undefined, project: Project | null | undefined): "owner" | "editor" | "viewer" | "none" => {
  if (!user || !project) return "none";
  if (project.ownerId === user.email) return "owner";
  
  const member = project.members.find(m => m.email === user.email);
  if (member) return member.role as "editor" | "viewer";
  
  return "none";
};

export const isProjectOwner = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  return getProjectRole(user, project) === "owner";
};

export const isProjectEditor = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  return getProjectRole(user, project) === "editor";
};

export const isProjectViewer = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  return getProjectRole(user, project) === "viewer";
};

export const canEditProject = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  const role = getProjectRole(user, project);
  return role === "owner" || role === "editor";
};

export const canManageMembers = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  return isProjectOwner(user, project);
};

export const canEditTasks = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  return canEditProject(user, project);
};

export const canSubmitEvaluations = (user: UserProfile | null | undefined, project: Project | null | undefined) => {
  // If the app requires all members to evaluate, we allow viewer.
  // But the user preferred: "Viewer cannot submit/update peer evaluations."
  // So only owner and editor can submit.
  return canEditProject(user, project);
};
