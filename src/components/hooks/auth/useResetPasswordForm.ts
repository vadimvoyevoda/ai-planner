import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function useResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur", // Walidacja po utracie fokusa
  });
  
  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const data = await authService.resetPassword(values.email);
      setSuccessMessage(data.message || "Link do resetowania hasła został wysłany na podany adres email");
      form.reset(); // Czyszczenie formularza po sukcesie
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas resetowania hasła");
      console.error("Reset password error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    error,
    successMessage,
    onSubmit: form.handleSubmit(onSubmit),
  };
} 