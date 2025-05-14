import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy adres email"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Walidacja po utracie fokusa
  });
  
  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const data = await authService.register(values.email, values.password);
      alert(data.message || "Sprawdź swoją skrzynkę email aby potwierdzić rejestrację");
      window.location.href = "/auth/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas rejestracji");
      console.error("Register error:", err);
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