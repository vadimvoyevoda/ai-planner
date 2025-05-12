import SupabaseProvider from "@/components/providers/SupabaseProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
