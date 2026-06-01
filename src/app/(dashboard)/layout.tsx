import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/ui/sidebar";
import DashboardClientLayout from "./client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get the merchant for this user
  const userWithMerchant = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      merchantUsers: {
        include: {
          merchant: {
            include: {
              stores: true,
            },
          },
        },
      },
    },
  });

  const merchantUser = userWithMerchant?.merchantUsers[0];
  const merchant = merchantUser?.merchant;

  if (!merchant) {
    // If no merchant exists, something went wrong with registration
    // They should probably be redirected to a generic error or onboarding route
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Your account is missing a merchant profile. Please contact support.</p>
      </div>
    );
  }

  const hasStore = merchant.stores.length > 0;
  const store = hasStore ? merchant.stores[0] : null;

  return (
    <DashboardClientLayout 
      merchantId={merchant.id} 
      hasStore={hasStore} 
      storeName={store?.name}
    >
      {children}
    </DashboardClientLayout>
  );
}
