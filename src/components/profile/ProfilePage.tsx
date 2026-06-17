import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Save, Settings, Sparkles, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/src/context/AuthContext";
import { UserAvatar } from "@/src/components/layout/UserAvatar";
import { Project, Task } from "@/src/types";
import { buildFullName } from "@/src/lib/utils";

interface ProfilePageProps {
  projects: Project[];
  tasks: Task[];
}

const roleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Documentation",
  "Team Lead",
  "QA / Testing",
  "Research",
  "General Member",
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ projects, tasks }) => {
  const { user, updateUser } = useAuth();
  const [peerScore, setPeerScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    role: user?.role || "",
    responsibilityArea: user?.responsibilityArea || "",
    teamPosition: user?.teamPosition || "",
    availability: user?.availability || "",
    bio: user?.bio || "",
    emailNotifications: user?.emailNotifications ?? true,
    showRole: user?.showRole ?? true,
    publicVisibility: user?.publicVisibility ?? false,
  });

  useEffect(() => {
    if (!user?.email) return;

    fetch(`/api/users/${encodeURIComponent(user.email)}/peer-score`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.score !== null && data?.score !== undefined) {
          setPeerScore(data.score);
        }
      })
      .catch(() => undefined);
  }, [user?.email]);

  const fullName = buildFullName(form.firstName, form.lastName);

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => {
      return task.isCompleted ?? task.completed ?? false;
    }).length;
  }, [tasks]);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedFirst || !trimmedLast || !trimmedEmail) {
      toast.error("Please fill in your first name, last name, and email.");
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        name: buildFullName(trimmedFirst, trimmedLast),
        email: trimmedEmail,
        role: form.role,
        responsibilityArea: form.responsibilityArea.trim(),
        teamPosition: form.teamPosition,
        availability: form.availability,
        bio: form.bio.trim(),
        emailNotifications: form.emailNotifications,
        showRole: form.showRole,
        publicVisibility: form.publicVisibility,
        profileCompleted: true,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-700">
      <section className="bento-card px-7 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Account Overview</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="mt-1 text-slate-600 font-medium">
            Manage your personal details, role, and workspace preferences.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[form.role, form.teamPosition, "Account Active"].filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-bold text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="md:max-w-md bg-orange-50/60 border border-orange-100/80 rounded-2xl p-4 flex gap-3 items-start">
          <div className="p-2 bg-orange-100 text-brand-primary rounded-xl shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Complete Your Profile</h4>
            <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
              By completing your profile details, let other team members learn about your expertise before adding you to their projects or before you start a new collaboration.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
        <aside className="bento-card p-6 lg:sticky lg:top-28">
          <div className="mx-auto mb-4 flex justify-center">
            <UserAvatar name={fullName || "PUER User"} size="xl" className="rounded-[1.6rem]" />
          </div>
          <h2 className="text-center text-xl font-black text-slate-900">{fullName || "PUER User"}</h2>
          <p className="mt-1 text-center text-sm font-medium text-slate-500">{form.email || "user@example.com"}</p>
          {form.role && (
            <div className="mx-auto mt-4 w-fit rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-brand-primary">
              {form.role}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 text-center">
              <strong className="block text-lg text-slate-900">{completedTasks}</strong>
              <span className="text-xs font-bold text-slate-500">Completed Tasks</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 text-center">
              <strong className="block text-lg text-slate-900">{peerScore ?? "—"}</strong>
              <span className="text-xs font-bold text-slate-500">Peer Score</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 text-center">
              <strong className="block text-lg text-slate-900">{projects.length}</strong>
              <span className="text-xs font-bold text-slate-500">Active Projects</span>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="bento-card overflow-hidden">
            <ProfileSectionHeader
              icon={<UserRound size={20} />}
              title="Personal Information"
              subtitle="Update your main profile details"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              <ProfileField label="First Name">
                <input
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="profile-input"
                />
              </ProfileField>
              <ProfileField label="Last Name">
                <input
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="profile-input"
                />
              </ProfileField>
              <ProfileField label="Email Address" fullWidth>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="profile-input"
                />
              </ProfileField>
            </div>
          </div>

          <div className="bento-card overflow-hidden">
            <ProfileSectionHeader
              icon={<Briefcase size={20} />}
              title="Project Role"
              subtitle="Define your responsibility in the team"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              <ProfileField label="Project Role">
                <select
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="profile-input"
                >
                  <option value="">Choose a Role...</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Responsibility Area">
                <input
                  value={form.responsibilityArea}
                  onChange={(event) => updateField("responsibilityArea", event.target.value)}
                  className="profile-input"
                />
              </ProfileField>
              <ProfileField label="Team Position">
                <select
                  value={form.teamPosition}
                  onChange={(event) => updateField("teamPosition", event.target.value)}
                  className="profile-input"
                >
                  <option value="">Choose a Position...</option>
                  <option value="Core Member">Core Member</option>
                  <option value="Lead Member">Lead Member</option>
                  <option value="Support Member">Support Member</option>
                </select>
              </ProfileField>
              <ProfileField label="Availability">
                <select
                  value={form.availability}
                  onChange={(event) => updateField("availability", event.target.value)}
                  className="profile-input"
                >
                  <option value="">Choose Availability...</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Partially Available">Partially Available</option>
                </select>
              </ProfileField>
              <ProfileField label="Short Bio" fullWidth>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className="profile-input min-h-28 resize-y py-3"
                />
              </ProfileField>
            </div>
          </div>

          <div className="bento-card overflow-hidden">
            <ProfileSectionHeader
              icon={<Settings size={20} />}
              title="Account Settings"
              subtitle="Security and preference options"
            />
            <div className="space-y-3 p-5">
              <ProfileToggle
                checked={form.emailNotifications}
                onChange={(value) => updateField("emailNotifications", value)}
                label="Email notifications enabled"
              />
              <ProfileToggle
                checked={form.showRole}
                onChange={(value) => updateField("showRole", value)}
                label="Show role in team profile"
              />
              <ProfileToggle
                checked={form.publicVisibility}
                onChange={(value) => updateField("publicVisibility", value)}
                label="Allow public project visibility"
              />
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-400 px-6 font-black text-white shadow-xl shadow-orange-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileSectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <div className="border-b border-slate-100 px-5 py-4">
    <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
      <span className="text-brand-primary">{icon}</span>
      {title}
    </h3>
    <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
  </div>
);

const ProfileField: React.FC<{ label: string; fullWidth?: boolean; children: React.ReactNode }> = ({
  label,
  fullWidth,
  children,
}) => (
  <label className={fullWidth ? "md:col-span-2" : ""}>
    <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
    {children}
  </label>
);

const ProfileToggle: React.FC<{ checked: boolean; onChange: (value: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-sm font-bold text-slate-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 accent-orange-500"
    />
    <span>{label}</span>
    {checked && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
  </label>
);
