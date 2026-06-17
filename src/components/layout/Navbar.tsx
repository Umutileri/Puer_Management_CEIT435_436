import React, { useEffect, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Star,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PuerLogo } from "./PuerLogo";
import { UserAvatar } from "./UserAvatar";
import { cn } from "../../lib/utils";

export type PageType = 'dashboard' | 'projects' | 'evaluations' | 'calendar' | 'profile';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("puer_theme") || "light");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("puer_theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as PageType, label: 'Projects', icon: FolderKanban },
    { id: 'evaluations' as PageType, label: 'Evaluations', icon: Star },
    { id: 'calendar' as PageType, label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/75 px-4 py-3 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="rounded-2xl pr-2 transition-transform hover:-translate-y-0.5"
          title="Go to dashboard"
        >
          <PuerLogo size="md" />
        </button>

        <div className="hidden items-center rounded-full border border-slate-200/80 bg-slate-900/[0.04] p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                  isActive 
                    ? "bg-brand-primary text-white shadow-lg shadow-orange-500/25" 
                    : "text-slate-500 hover:bg-orange-500/10 hover:text-slate-900"
                )}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-900/[0.04] text-slate-700 transition-colors hover:bg-orange-500/10 hover:text-brand-primary"
            title="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        
          {user && (
            <div ref={menuRef} className="relative">
              <button 
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-primary to-orange-400 py-1 pl-1 pr-3 text-white shadow-lg shadow-orange-500/25 transition-transform hover:-translate-y-0.5"
              >
                <UserAvatar name={user.name} size="md" className="border-white/70" />
                <ChevronDown size={15} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <span className="block text-xs font-bold text-slate-400">Logged in as</span>
                    <span className="block truncate text-sm font-black text-slate-700">{user.name}</span>
                    <span className="block truncate text-xs font-medium text-slate-500">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-orange-50 hover:text-brand-primary"
                  >
                    <UserRound size={16} />
                    Profile Settings
                  </button>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
