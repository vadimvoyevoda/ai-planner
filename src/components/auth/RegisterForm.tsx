import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";

interface RegisterFormProps {
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (email: string, password: string, confirmPassword: string) => void;
}

export default function RegisterForm({ isLoading = false, error = null, onSubmit }: RegisterFormProps) {
  const [email, setEmail] = React.useState("");
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
      onSubmit(email, password, confirmPassword);
    }
  };

  return (
    <AuthForm
      title="Rejestracja"
      submitText="Zarejestruj się"
      isLoading={isLoading}
      error={error || passwordError}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
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
        <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
