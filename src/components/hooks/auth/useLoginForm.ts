import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Walidacja po utracie fokusa
  });
  
  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const data = await authService.login(values.email, values.password);
      window.location.href = data.redirect || "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas logowania");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    error,
    onSubmit: form.handleSubmit(onSubmit),
  };
} 