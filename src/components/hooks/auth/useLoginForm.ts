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
      console.log("Form submitted, calling auth service...");
      const data = await authService.login(values.email, values.password);
      
      console.log("Login response received:", { 
        success: data?.success, 
        hasRedirect: !!data?.redirect,
        redirectTo: data?.redirect
      });
      
      if (data.success) {
        // Bardziej agresywne przekierowanie, które powinno zadziałać nawet w środowisku testowym
        const redirectUrl = data.redirect || "/";
        console.log("Redirecting to:", redirectUrl);
        
        // Próba różnych metod przekierowania, które mogą działać w różnych kontekstach
        try {
          // Metoda 1: Standardowe przekierowanie
          window.location.href = redirectUrl;
          
          // Metoda 2: Jako fallback, jeśli pierwsze przekierowanie nie zadziałało w ciągu 500ms
          setTimeout(() => {
            if (window.location.pathname !== redirectUrl) {
              console.log("Using fallback redirect method");
              window.location.assign(redirectUrl);
            }
          }, 500);
          
          // Metoda 3: Jeśli poprzednie metody zawodzą, spróbuj replace
          setTimeout(() => {
            if (window.location.pathname !== redirectUrl) {
              console.log("Using last resort redirect method");
              window.location.replace(redirectUrl);
            }
          }, 1000);
        } catch (redirectErr) {
          console.error("Error during redirect:", redirectErr);
          // Jeśli wszystkie metody zawodzą, spróbuj ostatecznego rozwiązania
          window.location.pathname = redirectUrl;
        }
      }
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