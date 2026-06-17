import React, { useEffect, useState, useRef } from "react";
import { Navbar, PageType } from "./components/layout/Navbar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { KanbanBoard } from "./components/kanban/Board";
import { TaskModal } from "./components/kanban/TaskModal";
import { usePersistence } from "./hooks/usePersistence";
import { Project, Task, Template } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Share2, Settings, Users, Plus, Pencil, FolderPlus, X } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { Auth } from "./components/auth/Auth";
import { LandingPage } from "./components/landing/LandingPage";
import { Evaluations } from "./components/evaluations/Evaluations";
import { CalendarPage } from "./components/calendar/CalendarPage";
import { ProfilePage } from "./components/profile/ProfilePage";
import { OnboardingIntro } from "./components/onboarding/OnboardingIntro";
import { ProfileSetup } from "./components/profile/ProfileSetup";
import { TemplateSelector } from "./components/templates/TemplateSelector";
import { cn } from "./lib/utils";
import { isProjectOwner, isProjectViewer, canEditProject, canManageMembers, canEditTasks, canSubmitEvaluations } from "./lib/permissions";

export default function App() {
  const { user } = useAuth();
  const { projects, tasks, createProjectFromTemplate, updateTaskColumn, addTask, updateTask, updateProject, deleteProject, deleteTask, loadProjectTasks } = usePersistence();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem("puer_current_project");
  });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collabRole, setCollabRole] = useState<'editor' | 'viewer'>('viewer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isCreatingFromProjects, setIsCreatingFromProjects] = useState(false);
  const [projectsNewTitle, setProjectsNewTitle] = useState("");
  const [projectsSelectedTemplate, setProjectsSelectedTemplate] = useState<Template | null>(null);

  const collaborateRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isCollaborating && collaborateRef.current && !collaborateRef.current.contains(e.target as Node)) {
        setIsCollaborating(false);
      }
      if (isSettingsOpen && settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (isMembersOpen && membersRef.current && !membersRef.current.contains(e.target as Node)) {
        setIsMembersOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCollaborating(false);
        setIsSettingsOpen(false);
        setIsMembersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCollaborating, isSettingsOpen, isMembersOpen]);

  // Load tasks on mount if there's a stored project
  React.useEffect(() => {
    if (currentProjectId) {
      loadProjectTasks(currentProjectId);
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
      setShowProfileSetup(false);
      return;
    }

    setShowProfileSetup(false);

    const pendingKey = `puer_intro_pending_${user.id}`;
    const completedKey = `puer_intro_completed_${user.id}`;
    setShowOnboarding(
      localStorage.getItem(pendingKey) === "true" &&
        localStorage.getItem(completedKey) !== "true"
    );
  }, [user]);

  const completeProfileSetup = () => {
    setShowProfileSetup(false);
    if (!user) return;
    const pendingKey = `puer_intro_pending_${user.id}`;
    const completedKey = `puer_intro_completed_${user.id}`;
    setShowOnboarding(
      localStorage.getItem(pendingKey) === "true" && localStorage.getItem(completedKey) !== "true"
    );
  };

  const completeOnboarding = () => {
    if (!user) return;
    localStorage.setItem(`puer_intro_completed_${user.id}`, "true");
    localStorage.removeItem(`puer_intro_pending_${user.id}`);
    setShowOnboarding(false);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    if (!canEditTasks(user, currentProject)) return;
    updateTask(id, updates);
    if (activeTask && activeTask.id === id) {
      setActiveTask((prev) => prev ? { ...prev, ...updates } : prev);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (!canEditTasks(user, currentProject)) return;
    deleteTask(id);
    if (activeTask && activeTask.id === id) {
      setActiveTask(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem("puer_current_project", projectId);
    setCurrentPage('projects');
    loadProjectTasks(projectId);
    const p = projects.find(proj => proj.id === projectId);
    if (p) setEditedTitle(p.title);
  };

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const projectTasks = tasks.filter((t) => t.projectId === currentProjectId);
  
  const isOwner = isProjectOwner(user, currentProject);
  const isViewer = isProjectViewer(user, currentProject);
  const canEdit = canEditProject(user, currentProject);

  const handleCreateProject = async (templateId: string, title: string) => {
    const id = await createProjectFromTemplate(templateId, title);
    setCurrentProjectId(id);
    toast.success("Project created successfully!");
  };

  const handleAddMember = () => {
    if (!currentProject || !canManageMembers(user, currentProject)) return;
    if (!collabEmail || collabEmail.trim() === "") return;
    updateProject(currentProject.id, { 
      members: [...currentProject.members, { email: collabEmail.trim(), role: collabRole }]
    });
    toast.success(`${collabEmail} added as ${collabRole}`);
    setCollabEmail("");
  };

  const handleAddTask = async (columnId: string) => {
    if (!currentProjectId || !canEditTasks(user, currentProject)) {
      toast.error("You do not have permission to add tasks.");
      return;
    }
    const newTask = await addTask({
      projectId: currentProjectId,
      columnId,
      title: "New Task",
      tags: ["General"],
      subtasks: []
    });
    setActiveTask(newTask);
  };



  const handleUpdateTaskColumn = (taskId: string, columnId: string) => {
    if (!canEditTasks(user, currentProject)) {
      toast.error("You do not have permission to move tasks.");
      return;
    }
    updateTaskColumn(taskId, columnId);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    if (!canEditProject(user, currentProject)) return;
    updateProject(id, updates);
  };

  const handleDeleteProject = () => {
    if (!isProjectOwner(user, currentProject)) {
      toast.error("Only the owner can delete this project.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(currentProject?.id || "");
      setCurrentProjectId(null);
      setIsSettingsOpen(false);
    }
  };

  if (!user) {
    if (authView === 'landing') {
      return (
        <>
          <Toaster position="bottom-right" />
          <LandingPage
            onLogin={() => setAuthView('login')}
            onRegister={() => setAuthView('register')}
          />
        </>
      );
    }
    return (
      <>
        <Toaster position="bottom-right" />
        <Auth
          key={authView}
          initialIsLogin={authView === 'login'}
          onBackToLanding={() => setAuthView('landing')}
        />
      </>
    );
  }

  if (showProfileSetup) {
    return (
      <>
        <Toaster position="bottom-right" />
        <ProfileSetup onComplete={completeProfileSetup} />
      </>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <Toaster position="bottom-right" />
        <OnboardingIntro userName={user.name} onComplete={completeOnboarding} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg select-none">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <Toaster position="bottom-right" />

      <main className="flex-1 p-6 pt-28 md:p-8 md:pt-28 max-w-[1600px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard
                projects={projects}
                tasks={tasks}
                currentUserName={user.name}
                onCreateProject={handleCreateProject}
                onSelectProject={handleSelectProject}
                onNavigateToTask={(projectId, taskId) => {
                  handleSelectProject(projectId);
                  const task = tasks.find(t => t.id === taskId);
                  if (task) setActiveTask(task);
                }}
              />
            </motion.div>
          )}

          {currentPage === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CalendarPage
                projects={projects}
                tasks={tasks}
                onNavigateToTask={(projectId, taskId) => {
                  handleSelectProject(projectId);
                  const task = tasks.find(t => t.id === taskId);
                  if (task) setActiveTask(task);
                }}
              />
            </motion.div>
          )}

          {currentPage === 'evaluations' && (
            <motion.div
              key="evaluations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Evaluations projects={projects} tasks={tasks} />
            </motion.div>
          )}

          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfilePage projects={projects} tasks={tasks} />
            </motion.div>
          )}

          {currentPage === 'projects' && (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-[calc(100vh-10rem)] flex flex-col space-y-6 max-w-7xl mx-auto w-full"
            >
              {!currentProjectId ? (
                <div className="flex-1">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">Projects</h2>
                      <p className="text-slate-600">Select a project to open its board details.</p>
                    </div>
                    <button
                      onClick={() => setIsCreatingFromProjects(true)}
                      className="bg-brand-primary text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-brand-primary/20"
                    >
                      <FolderPlus size={18} />
                      <span>New Project</span>
                    </button>
                  </div>
                  {projects.length === 0 ? (
                    <div className="h-[60vh] flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No projects yet</h3>
                        <p className="text-slate-600 mb-6">Create your first project to get started.</p>
                        <button onClick={() => setIsCreatingFromProjects(true)} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20">Create Project</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelectProject(project.id)}
                          className="text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-primary/40 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-orange-700 px-2 py-1 bg-orange-50 rounded-lg uppercase tracking-wider">
                              {project.templateId?.split("-")[0] || "General"}
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold">{project.members.length} members</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{project.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-4">{project.description}</p>
                          <div className="text-xs text-brand-primary font-bold">
                            {tasks.filter((t) => t.projectId === project.id).length} tasks
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Create Project Modal (Projects page) */}
                  <AnimatePresence>
                    {isCreatingFromProjects && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsCreatingFromProjects(false)}
                          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 md:p-12 kanban-scrollbar"
                        >
                          <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Design Your Workflow</h2>
                            <p className="text-slate-600 text-center mb-10">
                              Choose a template blueprint. Each includes workflow stages and starter tasks.
                            </p>

                            <div className="space-y-8">
                              <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Project Name</label>
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="e.g. CEIT 436 Group Project"
                                  value={projectsNewTitle}
                                  onChange={(e) => setProjectsNewTitle(e.target.value)}
                                  className="w-full text-2xl font-bold bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent rounded-2xl p-4 outline-none transition-all"
                                />
                              </div>

                              <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Blueprint</label>
                                <TemplateSelector selectedId={projectsSelectedTemplate?.id} onSelect={setProjectsSelectedTemplate} />
                              </div>

                              <div className="flex items-center gap-4 pt-4">
                                <button
                                  onClick={() => setIsCreatingFromProjects(false)}
                                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  disabled={!projectsNewTitle || !projectsSelectedTemplate}
                                  onClick={() => {
                                    if (!projectsNewTitle || !projectsSelectedTemplate) return;
                                    handleCreateProject(projectsSelectedTemplate.id, projectsNewTitle);
                                    setIsCreatingFromProjects(false);
                                    setProjectsNewTitle("");
                                    setProjectsSelectedTemplate(null);
                                  }}
                                  className={cn(
                                    "flex-[2] py-4 px-6 rounded-2xl font-bold text-white transition-all shadow-xl",
                                    !projectsNewTitle || !projectsSelectedTemplate
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
              ) : (
                <>
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => {
                          setCurrentProjectId(null);
                          localStorage.removeItem("puer_current_project");
                        }}
                    className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all text-slate-700 shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-orange-700 px-2.5 py-1 bg-orange-50 rounded-lg uppercase tracking-wider">
                         {currentProject?.templateId?.split("-")[0] || "Standard"} Blueprint
                       </span>
                    </div>
                    {isEditingTitle && canEdit ? (
                      <input
                        autoFocus
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={() => {
                          setIsEditingTitle(false);
                          if (currentProjectId && editedTitle.trim()) {
                            handleUpdateProject(currentProjectId, { title: editedTitle.trim() });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsEditingTitle(false);
                            if (currentProjectId && editedTitle.trim()) {
                              handleUpdateProject(currentProjectId, { title: editedTitle.trim() });
                            }
                          }
                        }}
                        className="text-3xl font-black text-slate-900 tracking-tight bg-slate-50 rounded-lg px-2 outline-none border border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                      />
                    ) : (
                      <div className="flex items-center gap-3 group/title">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{currentProject?.title}</h1>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditedTitle(currentProject?.title || "");
                              setIsEditingTitle(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-orange-50 rounded-lg opacity-0 group-hover/title:opacity-100 transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                  <div className="flex items-center gap-3">
                    <div className="relative" ref={membersRef}>
                      <button
                        onClick={() => {
                          setIsMembersOpen(!isMembersOpen);
                          setIsCollaborating(false);
                          setIsSettingsOpen(false);
                        }}
                        className="flex items-center justify-center px-3 h-10 rounded-full border border-slate-200 bg-white shadow-sm mr-4 text-xs font-bold text-slate-600 gap-2 hover:border-brand-primary/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <Users size={16} className="text-slate-500" />
                        <span>{(() => { const count = (currentProject?.members?.length ?? 0) + 1; return `${count} ${count === 1 ? 'Member' : 'Members'}`; })()}</span>
                      </button>
                      {isMembersOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-80 z-50">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Manage Members</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 kanban-scrollbar">
                            {currentProject?.ownerId && (
                              <div className="flex items-center justify-between bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                <span className="text-xs font-medium text-brand-primary truncate mr-2" title={currentProject.ownerId}>{currentProject.ownerId}</span>
                                <span className="text-[10px] font-bold text-orange-600 uppercase bg-white px-2 py-0.5 rounded shadow-sm border border-orange-100">Owner</span>
                              </div>
                            )}
                            {currentProject?.members.map((member, i) => (
                              <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg group">
                                <div className="flex flex-col min-w-0 flex-1 mr-2">
                                  <span className="text-xs font-medium text-slate-700 truncate" title={member.email}>{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isOwner ? (
                                    <button
                                      onClick={() => {
                                        const newMembers = [...currentProject.members];
                                        newMembers[i].role = member.role === 'editor' ? 'viewer' : 'editor';
                                        handleUpdateProject(currentProject.id, { members: newMembers });
                                      }}
                                      className="text-[10px] font-bold uppercase transition-colors text-slate-500 hover:text-brand-primary"
                                    >
                                      {member.role}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold uppercase text-slate-400 cursor-default">
                                      {member.role}
                                    </span>
                                  )}
                                  
                                  {isOwner && (
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(`Remove ${member.email} from project?`)) {
                                          const newMembers = currentProject.members.filter((_, idx) => idx !== i);
                                          handleUpdateProject(currentProject.id, { members: newMembers });
                                        }
                                      }}
                                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  
                  <div className="relative" ref={collaborateRef}>
                    <button 
                      onClick={() => {
                        setIsCollaborating(!isCollaborating);
                        setIsSettingsOpen(false);
                        setIsMembersOpen(false);
                      }} 
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:shadow-lg transition-all"
                    >
                      <Share2 size={16} className="text-brand-primary" />
                      <span>Collaborate</span>
                    </button>
                    {isCollaborating && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-80 z-50">
                        {isOwner ? (
                          <>
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Add Member</h4>
                            <input
                              autoFocus
                              type="email"
                              value={collabEmail}
                              onChange={(e) => setCollabEmail(e.target.value)}
                              placeholder="Email address"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-accent mb-3"
                            />
                            <div className="flex gap-2 mb-4">
                              <button
                                onClick={() => setCollabRole('viewer')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${collabRole === 'viewer' ? 'bg-orange-50 text-brand-primary border border-orange-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                              >
                                Viewer
                              </button>
                              <button
                                onClick={() => setCollabRole('editor')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${collabRole === 'editor' ? 'bg-orange-50 text-brand-primary border border-orange-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                              >
                                Editor
                              </button>
                            </div>
                            <button onClick={handleAddMember} className="w-full py-2 bg-brand-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors">
                              Add Member
                            </button>
                          </>
                        ) : (
                          <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg">
                            <p className="text-xs font-bold text-brand-primary">Only the project owner can add members.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {isOwner && (
                  <div className="relative" ref={settingsRef}>
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(!isSettingsOpen);
                        setIsCollaborating(false);
                        setIsMembersOpen(false);
                      }} 
                      className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                      <Settings size={20} />
                    </button>
                    {isSettingsOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl w-48 z-50 overflow-hidden">
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to permanently delete this project?")) {
                              deleteProject(currentProject?.id || "");
                              setCurrentProjectId(null);
                              setIsSettingsOpen(false);
                            }
                          }}
                          className="w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        >
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </header>

              {currentProject && (
                <KanbanBoard
                  project={currentProject}
                  tasks={projectTasks}
                  canEdit={canEdit}
                  onTaskMove={handleUpdateTaskColumn}
                  onAddTask={handleAddTask}
                  onTaskClick={setActiveTask}
                />
              )}
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {activeTask && (
          <TaskModal
            task={activeTask}
            canEdit={canEdit}
            currentUserId={user?.email}
            onClose={() => setActiveTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={() => handleDeleteTask(activeTask.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
