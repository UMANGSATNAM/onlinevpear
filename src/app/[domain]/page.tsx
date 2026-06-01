import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ClientStorefront } from "./client-page";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // We decode the domain (it could be URL encoded)
  const decodedDomain = decodeURIComponent(domain);

  // Find the store by customDomain or subdomain
  const store = await db.store.findFirst({
    where: {
      OR: [
        { customDomain: decodedDomain },
        { subdomain: decodedDomain.split(".")[0] }, // If it's something.onlinevpear.com, grab the something
      ],
    },
  });

  if (!store) {
    return notFound(); // Will trigger 404
  }

  return <ClientStorefront store={{
    id: store.id,
    name: store.name,
    slug: store.slug || store.subdomain || "",
    description: store.description,
    logo: store.logo,
    currency: store.currency,
    settings: store.settings
  }} />;
}
