import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  FolderKanban,
  Lock,
  Mail,
  Sparkles,
  User,
  UsersRound,
} from "lucide-react";
import { PuerLogo } from "../layout/PuerLogo";
import { toast } from "react-hot-toast";

interface AuthProps {
  initialIsLogin?: boolean;
  onBackToLanding?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ initialIsLogin = true, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      if (!termsAccepted) {
        toast.error("Please accept the terms and privacy policy.");
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin
      ? { email, password }
      : { email, password, firstName, lastName, name: `${firstName.trim()} ${lastName.trim()}`.trim() };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      login(data);
      if (!isLogin) {
        localStorage.setItem(`puer_intro_pending_${data.id}`, "true");
      }
      toast.success(isLogin ? "Welcome back!" : "Account created!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const brandCards = isLogin
    ? [
        { icon: CheckCircle2, text: "Track project progress clearly" },
        { icon: FolderKanban, text: "Manage tasks with a clean workflow" },
        { icon: BarChart3, text: "Monitor contributions with clarity" },
      ]
    : [
        { icon: UsersRound, text: "Create a team-ready workspace" },
        { icon: FolderKanban, text: "Manage project tasks efficiently" },
        { icon: BarChart3, text: "Monitor contributions with clarity" },
      ];

  return (
    <div className="auth-light-scope min-h-screen bg-[linear-gradient(135deg,#ffedd7_0%,#eef2ff_50%,#f8fbff_100%)] p-4 text-slate-900">
      <main className="flex min-h-screen items-center justify-center py-8">
        <section className="grid min-h-[610px] w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/60 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl lg:grid-cols-[1fr_0.95fr]">
          <aside className="relative flex flex-col gap-10 overflow-hidden border-b border-white/60 bg-white/35 p-7 lg:border-b-0 lg:border-r">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <PuerLogo size="lg" />
              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-black text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                >
                  <ArrowLeft size={14} className="text-brand-primary" />
                  <span>Back to Home</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login-brand" : "register-brand"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="relative max-w-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  {isLogin ? "Smart Teamwork" : "Project Setup"}
                </p>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  {isLogin ? "Welcome back." : "Create your account."}
                </h1>
                <p className="mt-4 max-w-lg text-sm font-semibold leading-7 text-slate-600 md:text-base">
                  {isLogin
                    ? "Log in to manage your projects, follow milestones, and keep your team workflow organized."
                    : "Start building your workspace, manage tasks, and organize your team inside a cleaner project flow."}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="relative grid gap-4">
              {brandCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex min-h-[64px] items-center gap-4 rounded-2xl border border-white/80 bg-white/55 px-5 py-4 shadow-sm shadow-slate-900/[0.03]"
                  >
                    <Icon size={20} className="text-brand-primary" />
                    <span className="text-sm font-black text-slate-700">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="flex items-center justify-center bg-white/45 p-6 md:p-8">
            <div className="w-full max-w-md">
              <div className="mb-6">
                <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-brand-primary">
                  <Sparkles size={14} />
                  Group Puer Workspace
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {isLogin ? "Login" : "Register"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {isLogin ? "Enter your account details to continue." : "Create your account to get started."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2"
                    >
                      <label className="space-y-2">
                        <span className="text-sm font-black text-slate-700">First Name</span>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required={!isLogin}
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            placeholder="First name"
                            className="auth-field"
                          />
                        </div>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-black text-slate-700">Last Name</span>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required={!isLogin}
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            placeholder="Last name"
                            className="auth-field"
                          />
                        </div>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="block space-y-2">
                  <span className="text-sm font-black text-slate-700">Email Address</span>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@example.com"
                      className="auth-field"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-black text-slate-700">Password</span>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={isLogin ? "Enter your password" : "Create a password"}
                      className="auth-field"
                    />
                  </div>
                </label>

                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.label
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="block space-y-2 overflow-hidden"
                    >
                      <span className="text-sm font-black text-slate-700">Confirm Password</span>
                      <div className="relative">
                        <Eye size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          required={!isLogin}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter your password"
                          className="auth-field"
                        />
                      </div>
                    </motion.label>
                  )}
                </AnimatePresence>

                {isLogin ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="h-4 w-4 accent-orange-500"
                      />
                      Remember me
                    </label>
                    <button type="button" className="text-sm font-black text-brand-primary">
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="h-4 w-4 accent-orange-500"
                    />
                    I agree to the terms and privacy policy
                  </label>
                )}

                <button
                  disabled={loading}
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.1rem] bg-gradient-to-r from-brand-primary to-orange-400 font-black text-white shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</span>
                  {!loading && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setConfirmPassword("");
                    setFirstName("");
                    setLastName("");
                    setTermsAccepted(false);
                  }}
                  className="font-black text-brand-primary"
                >
                  {isLogin ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};
