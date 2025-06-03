import * as React from "react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/LogoutButton";
import { isFeatureEnabled } from "@/features/featureFlags";

interface AuthButtonsProps {
  isLoggedIn: boolean;
}

export default function AuthButtons({ isLoggedIn }: AuthButtonsProps) {
  const [isAuthEnabled, setIsAuthEnabled] = React.useState(true);
  
  // Check if auth is enabled on component mount
  React.useEffect(() => {
    setIsAuthEnabled(isFeatureEnabled("auth"));
  }, []);
  
  // If auth is disabled, don't show any buttons
  if (!isAuthEnabled) {
    return null;
  }
  
  // If logged in, show logout button
  if (isLoggedIn) {
    return <LogoutButton />;
  }
  
  // If not logged in, show login button
  return (
    <Button variant="outline" onClick={() => window.location.href = "/auth/login"}>
      Zaloguj się
    </Button>
  );
} 