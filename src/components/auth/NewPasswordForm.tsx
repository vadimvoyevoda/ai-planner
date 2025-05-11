import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";

interface NewPasswordFormProps {
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (password: string, confirmPassword: string) => void;
}

export default function NewPasswordForm({ isLoading = false, error = null, onSubmit }: NewPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Hasła nie są identyczne");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Hasło musi mieć co najmniej 8 znaków");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validatePasswords()) {
      onSubmit(password, confirmPassword);
    }
  };

  return (
    <AuthForm
      title="Ustaw nowe hasło"
      submitText="Zapisz nowe hasło"
      isLoading={isLoading}
      error={error || passwordError}
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
            if (confirmPassword) validatePasswords();
          }}
          required
          autoComplete="new-password"
        />
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
            if (password) validatePasswords();
          }}
          required
          autoComplete="new-password"
        />
      </div>
    </AuthForm>
  );
}
