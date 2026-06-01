import { ReactNode } from "react";
import { Store } from "lucide-react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex h-16 items-center border-b bg-background px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6 text-primary" />
          <span>Online Vepar</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
