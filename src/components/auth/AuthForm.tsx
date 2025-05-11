import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
  submitText: string;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  footer?: React.ReactNode;
}

export default function AuthForm({
  title,
  children,
  submitText,
  isLoading = false,
  error = null,
  onSubmit,
  footer,
}: AuthFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          {children}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Proszę czekać..." : submitText}
          </Button>

          {footer && <div className="w-full text-center text-sm text-gray-500">{footer}</div>}
        </CardFooter>
      </form>
    </Card>
  );
}
