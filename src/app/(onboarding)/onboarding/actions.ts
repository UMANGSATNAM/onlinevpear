"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createStore(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const storeName = formData.get("storeName") as string;
  const subdomain = formData.get("subdomain") as string;

  if (!storeName || !subdomain) {
    throw new Error("Store name and subdomain are required");
  }

  // Format subdomain to lowercase and remove spaces/special chars
  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

  // Check if subdomain is already taken
  const existingStore = await db.store.findUnique({
    where: { subdomain: cleanSubdomain },
  });

  if (existingStore) {
    throw new Error("This subdomain is already taken");
  }

  try {
    // We use a transaction to ensure all records are created successfully
    await db.$transaction(async (tx) => {
      // 1. Create the merchant
      const merchant = await tx.merchant.create({
        data: {
          businessName: storeName,
          email: session.user.email!,
          onboardedAt: new Date(),
        },
      });

      // 2. Link the user to the merchant
      await tx.merchantUser.create({
        data: {
          userId: session.user.id,
          merchantId: merchant.id,
          role: "owner",
          permissions: JSON.stringify(["all"]),
          acceptedAt: new Date(),
        },
      });

      // 3. Create the store
      await tx.store.create({
        data: {
          merchantId: merchant.id,
          name: storeName,
          slug: cleanSubdomain,
          subdomain: cleanSubdomain,
        },
      });
    });

    // We can't redirect directly inside a try/catch if we want Next.js to handle it properly,
    // so we return success and redirect outside.
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create store:", error);
    throw new Error("Failed to create store. Please try again.");
  }
}
