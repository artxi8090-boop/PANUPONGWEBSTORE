"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const result = await login(data.email, data.password);
    if (result.success) {
      router.push("/");
    } else {
      setError("root", { message: result.error || "Login failed" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

      <AnimatePresence>
        {(error || errors.root) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm text-center"
          >
            {error || errors.root?.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <input
          type="email"
          {...register("email")}
          className="form-input w-full px-4 py-3 rounded-lg peer"
          placeholder=" "
          autoComplete="email"
          disabled={isLoading}
        />
        <label className="form-floating-label absolute left-4 top-3 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-14px] peer-focus:text-sm">
          Email
        </label>
        <Mail className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
        {errors.email && (
          <p className="error-message mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          className="form-input w-full px-4 py-3 rounded-lg peer"
          placeholder=" "
          autoComplete="current-password"
          disabled={isLoading}
        />
        <label className="form-floating-label absolute left-4 top-3 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-14px] peer-focus:text-sm">
          Password
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3.5"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {errors.password && (
          <p className="error-message mt-1">{errors.password.message}</p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isLoading}
        className="submit-btn w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Logging in...
          </span>
        ) : (
          "Login"
        )}
      </motion.button>

      <div className="text-center">
        <a
          href="#"
          className="text-sm text-gray-400 hover:text-neon-primary transition-colors"
        >
          Forgot Password?
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neon-bg text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => (window.location.href = "/api/auth/github")}
          className="social-login-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 2.618.903.753-.21 1.563-.315 2.37-.315s1.617.105 2.37.315c1.61-1.225 2.618-.903 2.618-.903.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          disabled
          className="social-login-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg opacity-50 cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </motion.button>
      </div>

      <div className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          className="text-neon-primary hover:text-neon-secondary transition-colors"
        >
          Sign up
        </a>
      </div>
    </form>
  );
}
