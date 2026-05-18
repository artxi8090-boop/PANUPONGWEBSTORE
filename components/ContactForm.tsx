"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactForm() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const contactSchema = z.object({
    name: z
      .string()
      .min(1, t.contact.validation.nameRequired)
      .max(100, t.contact.validation.nameMax),
    email: z
      .string()
      .min(1, t.contact.validation.emailRequired)
      .email(t.contact.validation.emailInvalid),
    message: z
      .string()
      .min(1, t.contact.validation.messageRequired)
      .max(2000, t.contact.validation.messageMax),
  });

  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          setErrorMessage(result.details.map((d: { message: string }) => d.message).join(", "));
        } else {
          setErrorMessage(result.error || t.contact.serverError);
        }
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      reset();
    } catch {
      setErrorMessage(t.contact.connectionError);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16" id="contact">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-12 text-center text-white">
          {t.contact.heading}
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-2xl mx-auto space-y-6"
          noValidate
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              {t.contact.nameLabel}
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t.contact.namePlaceholder}
              className={`bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-neon-cyan ${
                errors.name ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              {t.contact.emailLabel}
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t.contact.emailPlaceholder}
              className={`bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-neon-cyan ${
                errors.email ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              {t.contact.messageLabel}
            </label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder={t.contact.messagePlaceholder}
              className={`min-h-[150px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-neon-cyan ${
                errors.message ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            <AnimatePresence>
              {errors.message && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.message.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg text-sm"
              >
                {t.contact.successMessage}
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full bg-neon-cyan text-black hover:bg-cyan-500 shadow-lg shadow-neon-cyan/30"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {t.contact.submitting}
              </span>
            ) : (
              t.contact.submit
            )}
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
