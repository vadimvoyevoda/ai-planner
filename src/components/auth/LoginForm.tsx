import * as React from "react";
import { useLoginForm } from "@/components/hooks/auth/useLoginForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthForm from "./AuthForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginForm() {
  const { form, isSubmitting, error, onSubmit } = useLoginForm();
  
  return (
    <AuthForm
      title="Logowanie"
      submitText="Zaloguj się"
      isLoading={isSubmitting}
      error={error}
      onSubmit={onSubmit}
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
                    data-test-id="login-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="password"
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    data-test-id="login-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </AuthForm>
  );
}
