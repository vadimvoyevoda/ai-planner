import * as React from "react";
import { useResetPasswordForm } from "@/components/hooks/auth/useResetPasswordForm";
import { Input } from "@/components/ui/input";
import AuthForm from "./AuthForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ResetPasswordForm() {
  const { form, isSubmitting, error, successMessage, onSubmit } = useResetPasswordForm();
  
  return (
    <AuthForm
      title="Reset hasła"
      submitText="Wyślij link do resetu"
      isLoading={isSubmitting}
      error={error}
      onSubmit={onSubmit}
      footer={
        <div>
          Pamiętasz hasło?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </a>
        </div>
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="email"
                    placeholder="twoj@email.com"
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                {successMessage && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                    {successMessage}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Wyślemy Ci link do zresetowania hasła na podany adres email.
                </p>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </AuthForm>
  );
}
