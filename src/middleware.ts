import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers.get("host")!;

  // Handle local development subdomains
  hostname = hostname.replace(".localhost:3000", "");

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Define the root domain from env, or default to localhost:3000
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // If the request is for the main SaaS domain or www, OR it's the Railway deployment URL
  if (
    hostname === rootDomain || 
    hostname === `www.${rootDomain}` || 
    hostname.endsWith(".up.railway.app")
  ) {
    // We rewrite everything to the /(marketing) route
    return NextResponse.rewrite(new URL(`/(marketing)${path}`, req.url));
  }

  // If the request is for the app/admin dashboard subdomain (e.g., app.onlinevpear.com)
  if (hostname === `app.${rootDomain}`) {
    return NextResponse.rewrite(new URL(`/(dashboard)${path}`, req.url));
  }

  // Rewrite everything else to the `/[domain]` dynamic route for storefronts
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
