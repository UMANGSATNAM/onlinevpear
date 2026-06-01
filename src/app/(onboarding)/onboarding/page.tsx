"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createStore } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-generate subdomain from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStoreName(value);
    if (!subdomain || subdomain === storeName.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, -1)) {
      setSubdomain(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("storeName", storeName);
      formData.append("subdomain", subdomain);
      
      const result = await createStore(formData);
      
      if (result.success) {
        toast.success("Store created successfully!");
        // We do a hard refresh to the admin dashboard so the session updates its merchants
        window.location.href = "/admin"; 
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Let's set up your store</CardTitle>
        <CardDescription>
          Choose a name and a web address for your new online business.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              placeholder="e.g. Acme Electronics"
              required
              value={storeName}
              onChange={handleStoreNameChange}
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subdomain">Store URL</Label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                placeholder="acme-electronics"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={loading}
                className="rounded-r-none focus-visible:z-10"
              />
              <div className="flex h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                .onlinevpear.com
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can connect a custom domain (like www.yourdomain.com) later.
            </p>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating your store..." : "Create Store"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
