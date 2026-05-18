import { create } from "zustand";

export type UserRole = "client" | "freelancer";

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  isLoading: boolean;
  error: string | null;
  showSuccessAnimation: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  dismissSuccessAnimation: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  showSuccessAnimation: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        set({ isAuthenticated: true, user: data.user, isLoading: false, showSuccessAnimation: true });
        return { success: true };
      }
      set({ isLoading: false, error: data.error || "Login failed" });
      return { success: false, error: data.error };
    } catch {
      set({ isLoading: false, error: "Network error. Please try again." });
      return { success: false, error: "Network error" };
    }
  },

  signup: async (name: string, email: string, password: string, role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        set({ isAuthenticated: true, user: data.user, isLoading: false, showSuccessAnimation: true });
        return { success: true };
      }
      set({ isLoading: false, error: data.error || "Signup failed" });
      return { success: false, error: data.error };
    } catch {
      set({ isLoading: false, error: "Network error. Please try again." });
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    }
    set({ isAuthenticated: false, user: null, error: null, showSuccessAnimation: false });
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ isAuthenticated: true, user: data.user });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
  dismissSuccessAnimation: () => set({ showSuccessAnimation: false }),
}));
