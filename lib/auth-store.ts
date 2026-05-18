import { create } from "zustand";

export type UserRole = "client" | "freelancer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
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

async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch {
    return null;
  }
}

async function parseJson(response: Response | null) {
  if (!response) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  showSuccessAnimation: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await safeFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJson(res);
      if (data?.success) {
        set({ isAuthenticated: true, user: data.user, isLoading: false, showSuccessAnimation: true });
        return { success: true };
      }
      set({ isLoading: false, error: data?.error || "Login failed" });
      return { success: false, error: data?.error };
    } catch {
      set({ isLoading: false, error: "Network error. Please try again." });
      return { success: false, error: "Network error" };
    }
  },

  signup: async (name: string, email: string, password: string, role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const res = await safeFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await parseJson(res);
      if (data?.success) {
        set({ isAuthenticated: true, user: data.user, isLoading: false, showSuccessAnimation: true });
        return { success: true };
      }
      set({ isLoading: false, error: data?.error || "Signup failed" });
      return { success: false, error: data?.error };
    } catch {
      set({ isLoading: false, error: "Network error. Please try again." });
      return { success: false, error: "Network error" };
    }
  },

  logout: async () => {
    try {
      await safeFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Silently ignore network errors during logout
    }
    set({ isAuthenticated: false, user: null, error: null, showSuccessAnimation: false });
  },

  checkAuth: async () => {
    try {
      const res = await safeFetch("/api/auth/me");
      if (res?.ok) {
        const data = await parseJson(res);
        if (data?.success && data.user) {
          set({ isAuthenticated: true, user: data.user });
          return;
        }
      }
      set({ isAuthenticated: false, user: null });
    } catch {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
  dismissSuccessAnimation: () => set({ showSuccessAnimation: false }),
}));
