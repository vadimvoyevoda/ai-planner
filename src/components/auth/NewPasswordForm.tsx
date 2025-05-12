import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";
import { z } from "zod";

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

interface NewPasswordFormProps {
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (password: string) => Promise<void>;
}

export default function NewPasswordForm({
  isLoading: initialLoading = false,
  error: initialError = null,
  onSubmit,
}: NewPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(initialError);

  const validateField = (field: "password" | "confirmPassword", value: string) => {
    try {
      if (field === "confirmPassword") {
        newPasswordSchema.parse({ password, confirmPassword: value });
      } else {
        z.string().min(8, "Hasło musi mieć minimum 8 znaków").parse(value);
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
    setIsLoading(true);

    try {
      const formData = { password, confirmPassword };
      newPasswordSchema.parse(formData);

      await onSubmit(password);
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
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Wystąpił błąd podczas zmiany hasła");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Ustaw nowe hasło"
      submitText="Zapisz nowe hasło"
      isLoading={isLoading}
      error={submitError}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="password">Nowe hasło</Label>
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
          disabled={isLoading}
          className={validationErrors.password ? "border-red-500" : ""}
        />
        {validationErrors.password && (
          <p id="password-error" className="text-sm text-red-500">
            {validationErrors.password}
          </p>
        )}
        <p className="text-sm text-gray-500">Minimum 8 znaków</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
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
          disabled={isLoading}
          className={validationErrors.confirmPassword ? "border-red-500" : ""}
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
