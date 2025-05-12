import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

interface LoginFormProps {
  isLoading?: boolean;
  error?: string | null;
}

export default function LoginForm({ isLoading: initialLoading = false, error: initialError = null }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(initialError);

  const validateField = (field: "email" | "password", value: string) => {
    try {
      loginSchema.shape[field].parse(value);
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
      setSubmitError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors((prev) => ({ ...prev, [field]: err.errors[0].message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setIsLoading(true);
    setValidationErrors({});

    try {
      // Walidacja formularza przed wysłaniem
      const formData = { email, password };
      loginSchema.parse(formData);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login error response:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
        });

        if (response.status === 401) {
          setSubmitError("Nieprawidłowy email lub hasło");
        } else if (response.status === 400) {
          setSubmitError(data.error || "Nieprawidłowe dane logowania");
        } else if (response.status === 429) {
          setSubmitError("Zbyt wiele prób logowania. Spróbuj ponownie później.");
        } else {
          setSubmitError(data.error || "Wystąpił błąd podczas logowania. Spróbuj ponownie.");
        }
        return;
      }

      // Przekierowanie po udanym logowaniu
      window.location.href = data.redirect || "/";
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }),
          {}
        );
        setValidationErrors(errors);
        setSubmitError("Sprawdź poprawność wprowadzonych danych");
      } else if (err instanceof Error) {
        setSubmitError(`Błąd podczas logowania: ${err.message}`);
      } else {
        setSubmitError("Wystąpił nieoczekiwany błąd podczas logowania");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Logowanie"
      submitText="Zaloguj się"
      isLoading={isLoading}
      error={submitError}
      onSubmit={handleSubmit}
      footer={
        <>
          <div>
            Nie masz jeszcze konta?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              Zarejestruj się
            </a>
          </div>
          <div>
            <a href="/auth/reset-password" className="text-blue-600 hover:underline">
              Zapomniałeś hasła?
            </a>
          </div>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateField("email", e.target.value);
          }}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
          aria-invalid={!!validationErrors.email}
          aria-errormessage="email-error"
          disabled={isLoading}
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p id="email-error" className="text-sm text-red-500">
            {validationErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validateField("password", e.target.value);
          }}
          required
          autoComplete="current-password"
          aria-invalid={!!validationErrors.password}
          aria-errormessage="password-error"
          disabled={isLoading}
          className={validationErrors.password ? "border-red-500" : ""}
        />
        {validationErrors.password && (
          <p id="password-error" className="text-sm text-red-500">
            {validationErrors.password}
          </p>
        )}
      </div>
    </AuthForm>
  );
}
