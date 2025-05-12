import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useSupabase } from "@/components/providers/SupabaseProvider";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { supabase, user } = useSupabase();

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = "/auth/login";
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar className="fixed left-0 top-0 z-40 h-screen w-64">
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4 p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/")}>
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/meetings")}>
              Meetings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation("/notes")}>
              Notes
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </Sidebar>
      <main className={cn("ml-64 p-8", className)}>{children}</main>
      <Toaster />
    </div>
  );
}
