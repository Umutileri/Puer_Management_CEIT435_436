import React, { useState } from "react";
import { ArrowRight, Briefcase, Save, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/src/context/AuthContext";
import { UserAvatar } from "@/src/components/layout/UserAvatar";
import { buildFullName } from "@/src/lib/utils";

interface ProfileSetupProps {
  onComplete: () => void;
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

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    role: user?.role || "",
    responsibilityArea: user?.responsibilityArea || "",
    teamPosition: user?.teamPosition || "",
    availability: user?.availability || "",
    bio: user?.bio || "",
  });

  const fullName = buildFullName(form.firstName, form.lastName);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter your first and last name.");
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: buildFullName(form.firstName, form.lastName),
        role: form.role,
        responsibilityArea: form.responsibilityArea.trim(),
        teamPosition: form.teamPosition,
        availability: form.availability,
        bio: form.bio.trim(),
        profileCompleted: true,
      });
      toast.success("Profile created successfully.");
      onComplete();
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="intro-light-scope fixed inset-0 z-[200] overflow-y-auto bg-[linear-gradient(135deg,#ffedd7_0%,#eef2ff_50%,#f8fbff_100%)] p-4 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl"
        >
          <div className="border-b border-slate-100 px-8 py-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Profile Setup</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Create your profile</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Tell your team who you are. Your avatar will show your name initials only.
            </p>
          </div>

          <div className="space-y-6 px-8 py-6">
            <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border border-slate-100 bg-white/80 p-6">
              <UserAvatar name={fullName || "PUER User"} size="xl" />
              <p className="text-lg font-black text-slate-900">{fullName || "Your Name"}</p>
              <p className="text-sm font-medium text-slate-500">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">First Name</span>
                <input
                  required
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="profile-input"
                  placeholder="Umut"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Last Name</span>
                <input
                  required
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="profile-input"
                  placeholder="İleri"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Briefcase size={16} className="text-brand-primary" />
                  Project Role
                </span>
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
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Team Position</span>
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
              </label>
            </div>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">Responsibility Area</span>
              <input
                value={form.responsibilityArea}
                onChange={(event) => updateField("responsibilityArea", event.target.value)}
                className="profile-input"
                placeholder="e.g. Dashboard UI, backend API, documentation"
              />
            </label>

            <label>
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <UserRound size={16} className="text-brand-primary" />
                Short Bio
              </span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className="profile-input min-h-28 resize-y py-3"
                placeholder="Briefly describe your focus in the team..."
              />
            </label>
          </div>

          <div className="flex justify-end border-t border-slate-100 px-8 py-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-400 px-6 font-black text-white shadow-xl shadow-orange-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Profile & Continue"}
              {!saving && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
