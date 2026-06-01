"use client";

import { useAppStore } from "@/lib/store";
import { OverviewDashboard } from "@/components/dashboard/overview";
import { ProductsManagement } from "@/components/dashboard/products";
import { ProductForm } from "@/components/dashboard/product-form";
import { OrdersManagement } from "@/components/dashboard/orders";
import { OrderDetail } from "@/components/dashboard/order-detail";
import { CustomersManagement } from "@/components/dashboard/customers";
import { CustomerDetail } from "@/components/dashboard/customer-detail";
import { AnalyticsDashboard } from "@/components/dashboard/analytics";
import { MarketingAutomation } from "@/components/dashboard/marketing";
import { DiscountsManagement } from "@/components/dashboard/discounts";
import { BillingSubscription } from "@/components/dashboard/billing";
import { ThemeCustomization } from "@/components/dashboard/themes";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { StoreSettings } from "@/components/dashboard/store-settings";
import { CategoriesManagement } from "@/components/dashboard/categories";
import { InventoryManagement } from "@/components/dashboard/inventory";
import { ShippingSettings } from "@/components/dashboard/shipping-settings";
import { CurrencySettings } from "@/components/dashboard/currency-settings";
import { CouponBuilder } from "@/components/dashboard/coupon-builder";
import { EmailTemplates } from "@/components/dashboard/email-templates";
import { GiftCardsManagement } from "@/components/dashboard/gift-cards";
import { LoyaltyProgram } from "@/components/dashboard/loyalty";
import { AbandonedCartRecovery } from "@/components/dashboard/abandoned-carts";
import { SeoDashboard } from "@/components/dashboard/seo-dashboard";
import { SocialMedia } from "@/components/dashboard/social-media";
import { ReviewsManagement } from "@/components/dashboard/reviews";
import { StaffManagement } from "@/components/dashboard/staff";
import { WorkflowsManagement } from "@/components/dashboard/workflows";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { AppsMarketplace } from "@/components/dashboard/apps";
import { DataImport } from "@/components/dashboard/data-import";

export default function AdminDashboardPage() {
  const { dashboardPage } = useAppStore();

  const renderPage = () => {
    switch (dashboardPage) {
      case "overview": return <OverviewDashboard />;
      case "products": return <ProductsManagement />;
      case "product-new": return <ProductForm />;
      case "categories": return <CategoriesManagement />;
      case "inventory": return <InventoryManagement />;
      case "orders": return <OrdersManagement />;
      // case "order-detail": return <OrderDetail />; // No type for order-detail in DashboardPage yet, handled internally maybe? Wait, checking the store
      case "customers": return <CustomersManagement />;
      // case "customer-detail": return <CustomerDetail />;
      case "analytics": return <AnalyticsDashboard />;
      case "marketing": return <MarketingAutomation />;
      case "discounts": return <DiscountsManagement />;
      case "shipping-settings": return <ShippingSettings />;
      case "currency-settings": return <CurrencySettings />;
      case "themes": return <ThemeCustomization />;
      case "theme-editor": return <ThemeEditor />;
      case "store-settings": return <StoreSettings />;
      case "billing": return <BillingSubscription />;
      case "coupon-builder": return <CouponBuilder />;
      case "email-templates": return <EmailTemplates />;
      case "gift-cards": return <GiftCardsManagement />;
      case "loyalty": return <LoyaltyProgram />;
      case "abandoned-carts": return <AbandonedCartRecovery />;
      case "seo-dashboard": return <SeoDashboard />;
      case "social-media": return <SocialMedia />;
      case "reviews": return <ReviewsManagement />;
      case "staff": return <StaffManagement />;
      case "workflows": return <WorkflowsManagement />;
      case "ai-assistant": return <AiAssistant />;
      case "apps": return <AppsMarketplace />;
      case "data-import": return <DataImport />;
      default: return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex-1 w-full p-2 sm:p-4">
      {renderPage()}
    </div>
  );
}
