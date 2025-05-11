import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";

interface ResetPasswordFormProps {
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (email: string) => void;
}

export default function ResetPasswordForm({ isLoading = false, error = null, onSubmit }: ResetPasswordFormProps) {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <AuthForm
      title="Reset hasła"
      submitText="Wyślij link do resetu"
      isLoading={isLoading}
      error={error}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
        />
        <p className="text-sm text-gray-500">Wyślemy Ci link do zresetowania hasła na podany adres email.</p>
      </div>
    </AuthForm>
  );
}
