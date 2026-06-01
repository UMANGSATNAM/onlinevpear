import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function StorefrontPage({
  params,
}: {
  params: { domain: string };
}) {
  const { domain } = params;

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{store.name}</h1>
      <p className="mt-4 text-xl text-muted-foreground">{store.description || "Welcome to our store!"}</p>
    </div>
  );
}
