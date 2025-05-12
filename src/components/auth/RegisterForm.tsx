import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";
import { z } from "zod";

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

interface RegisterFormProps {
  isLoading?: boolean;
  error?: string | null;
}

export default function RegisterForm({ isLoading = false, error = null }: RegisterFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(error);

  const validateField = (field: "email" | "password" | "confirmPassword", value: string) => {
    try {
      if (field === "confirmPassword") {
        registerSchema.parse({ email, password, confirmPassword: value });
      } else {
        registerSchema.shape[field].parse(value);
      }
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.errors.find((e) => e.path[0] === field);
        if (fieldError) {
          setValidationErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const formData = { email, password, confirmPassword };
      registerSchema.parse(formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          setSubmitError(data.error || "Nieprawidłowe dane rejestracji");
        } else if (response.status === 429) {
          setSubmitError("Zbyt wiele prób rejestracji. Spróbuj ponownie później.");
        } else {
          setSubmitError(data.error || "Wystąpił błąd podczas rejestracji");
        }
        return;
      }

      alert(data.message || "Sprawdź swoją skrzynkę email aby potwierdzić rejestrację");
      window.location.href = "/auth/login";
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path[0]]: curr.message,
          }),
          {}
        );
        setValidationErrors(errors);
      } else {
        setSubmitError("Wystąpił błąd podczas rejestracji");
      }
    }
  };

  return (
    <AuthForm
      title="Rejestracja"
      submitText="Zarejestruj się"
      isLoading={isLoading}
      error={submitError}
      onSubmit={handleSubmit}
      footer={
        <div>
          Masz już konto?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </a>
        </div>
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
            if (confirmPassword) {
              validateField("confirmPassword", confirmPassword);
            }
          }}
          required
          autoComplete="new-password"
          aria-invalid={!!validationErrors.password}
          aria-errormessage="password-error"
        />
        {validationErrors.password && (
          <p id="password-error" className="text-sm text-red-500">
            {validationErrors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            validateField("confirmPassword", e.target.value);
          }}
          required
          autoComplete="new-password"
          aria-invalid={!!validationErrors.confirmPassword}
          aria-errormessage="confirm-password-error"
        />
        {validationErrors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-red-500">
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>
    </AuthForm>
  );
}
