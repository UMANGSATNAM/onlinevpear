"use client";

import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";

export default function DashboardClientLayout({
  merchantId,
  hasStore,
  storeName,
  children,
}: {
  merchantId: string;
  hasStore: boolean;
  storeName?: string;
  children: React.ReactNode;
}) {
  const [showOnboarding, setShowOnboarding] = useState(!hasStore);

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          open={showOnboarding}
          onClose={() => {
            // Only allow closing if they have a store
            if (hasStore) setShowOnboarding(false);
          }}
          merchantId={merchantId}
        />
      )}

      <SidebarProvider>
        <AppSidebar storeName={storeName || "My Store"} />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          {/* Topbar */}
          <header className="h-16 flex items-center px-4 border-b bg-background shrink-0">
            <SidebarTrigger className="mr-4" />
            <div className="font-semibold text-lg">{storeName || "Dashboard"}</div>
            <div className="ml-auto flex items-center space-x-4">
              {/* Add user profile dropdown or notifications here later */}
            </div>
          </header>
          {/* Main Content Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
