import * as React from "react";
import { useRegisterForm } from "@/components/hooks/auth/useRegisterForm";
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

export default function RegisterForm() {
  const { form, isSubmitting, error, onSubmit } = useRegisterForm();
  
  return (
    <AuthForm
      title="Rejestracja"
      submitText="Zarejestruj się"
      isLoading={isSubmitting}
      error={error}
      onSubmit={onSubmit}
      footer={
        <div>
          Masz już konto?{" "}
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
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdź hasło</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="password"
                    required
                    autoComplete="new-password"
                    disabled={isSubmitting}
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
