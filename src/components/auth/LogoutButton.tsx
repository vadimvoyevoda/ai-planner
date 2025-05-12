import * as React from "react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Błąd wylogowania");
      }

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}
