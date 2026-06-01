"use client";

import { useAppStore } from "@/lib/store";
import { StoreLayout } from "@/components/storefront/store-layout";
import { StorefrontHome } from "@/components/storefront/home";
import { ProductGridPage } from "@/components/storefront/product-grid-page";
import { ProductDetail } from "@/components/storefront/product-detail";
import { CategoryPage } from "@/components/storefront/category";
import { SearchPage } from "@/components/storefront/search";
import { ShoppingCartPage } from "@/components/storefront/cart";
import { CheckoutPage } from "@/components/storefront/checkout";
import { WishlistPage } from "@/components/storefront/wishlist";
import { AccountPage } from "@/components/storefront/account";
import { BlogPage } from "@/components/storefront/blog";
import { ProductComparison } from "@/components/storefront/product-comparison";
import { useEffect } from "react";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  currency: string;
  settings?: string;
}

export function ClientStorefront({ store }: { store: StoreData }) {
  const { storefrontPage, setSelectedStoreId, setCurrentView } = useAppStore();

  useEffect(() => {
    setSelectedStoreId(store.id);
    setCurrentView("storefront");
  }, [store.id, setSelectedStoreId, setCurrentView]);

  const renderPage = () => {
    switch (storefrontPage) {
      case "home": return <StorefrontHome />;
      case "products": return <ProductGridPage />;
      case "product": return <ProductDetail />;
      case "category": return <CategoryPage />;
      case "search": return <SearchPage />;
      case "cart": return <ShoppingCartPage />;
      case "checkout": return <CheckoutPage />;
      case "wishlist": return <WishlistPage />;
      case "account": return <AccountPage />;
      case "blog": return <BlogPage />;
      case "compare": return <ProductComparison />;
      default: return <StorefrontHome />;
    }
  };

  return (
    <StoreLayout store={store} cartItemCount={0}>
      {renderPage()}
    </StoreLayout>
  );
}
