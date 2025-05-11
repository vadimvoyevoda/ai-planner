import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";

interface LoginFormProps {
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (email: string, password: string) => void;
}

export default function LoginForm({ isLoading = false, error = null, onSubmit }: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <AuthForm
      title="Logowanie"
      submitText="Zaloguj się"
      isLoading={isLoading}
      error={error}
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
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
    </AuthForm>
  );
}
