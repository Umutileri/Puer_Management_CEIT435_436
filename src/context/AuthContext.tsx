import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  responsibilityArea?: string;
  teamPosition?: string;
  availability?: string;
  bio?: string;
  emailNotifications?: boolean;
  showRole?: boolean;
  publicVisibility?: boolean;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("puer_user", JSON.stringify(userData));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("puer_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User;
      setUser(parsed);
      fetch(`/api/users/profile?email=${encodeURIComponent(parsed.email)}`)
        .then((res) => (res.ok ? res.json() : parsed))
        .then((profile) => persistUser(profile))
        .catch(() => undefined)
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    persistUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("puer_user");
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...updates }),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const updated = await response.json();
    persistUser(updated);
  };

  const refreshUser = async () => {
    if (!user) return;

    const response = await fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`);
    if (!response.ok) return;

    const profile = await response.json();
    persistUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
