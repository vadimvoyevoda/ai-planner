import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

interface ResetPasswordFormProps {
  isLoading?: boolean;
  error?: string | null;
}

export default function ResetPasswordForm({
  isLoading: initialLoading = false,
  error: initialError = null,
}: ResetPasswordFormProps) {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const validateEmail = (value: string) => {
    try {
      resetPasswordSchema.parse({ email: value });
      setValidationError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0].message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Walidacja email przed wysłaniem
      resetPasswordSchema.parse({ email });

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Reset password error response:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
        });

        if (response.status === 400) {
          setSubmitError(data.error || "Nieprawidłowy format adresu email");
        } else if (response.status === 429) {
          setSubmitError("Zbyt wiele prób resetowania hasła. Spróbuj ponownie później.");
        } else {
          setSubmitError(data.error || "Wystąpił błąd podczas resetowania hasła");
        }
        return;
      }

      // Wyświetl komunikat o sukcesie
      setSuccessMessage(data.message || "Link do resetowania hasła został wysłany na podany adres email");
      setEmail(""); // Wyczyść pole email po sukcesie
    } catch (err) {
      console.error("Reset password error:", err);

      if (err instanceof z.ZodError) {
        setSubmitError("Nieprawidłowy format adresu email");
      } else if (err instanceof Error) {
        setSubmitError(`Błąd podczas resetowania hasła: ${err.message}`);
      } else {
        setSubmitError("Wystąpił nieoczekiwany błąd podczas resetowania hasła");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Reset hasła"
      submitText="Wyślij link do resetu"
      isLoading={isLoading}
      error={submitError}
      onSubmit={handleSubmit}
      footer={
        <div>
          Pamiętasz hasło?{" "}
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
            validateEmail(e.target.value);
          }}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
          aria-invalid={!!validationError}
          aria-errormessage="email-error"
          disabled={isLoading}
          className={validationError ? "border-red-500" : ""}
        />
        {validationError && (
          <p id="email-error" className="text-sm text-red-500">
            {validationError}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{successMessage}</p>
        )}
        <p className="text-sm text-gray-500">Wyślemy Ci link do zresetowania hasła na podany adres email.</p>
      </div>
    </AuthForm>
  );
}
