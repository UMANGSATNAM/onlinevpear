import { create } from "zustand"

export type AppView = "dashboard" | "storefront" | "admin"
export type DashboardPage = 
  | "overview"
  | "products"
  | "product-new"
  | "categories"
  | "inventory"
  | "orders"
  | "customers"
  | "analytics"
  | "marketing"
  | "discounts"
  | "shipping"
  | "tax"
  | "themes"
  | "pages"
  | "blog"
  | "ai-assistant"
  | "workflows"
  | "apps"
  | "settings"
  | "staff"
  | "billing"
  | "store-settings"
  | "reviews"

export type AdminPage =
  | "overview"
  | "merchants"
  | "revenue"
  | "plans"
  | "infrastructure"
  | "ai-monitoring"
  | "abuse"
  | "analytics"
  | "feature-flags"
  | "cms"
  | "support"
  | "audit-logs"
  | "security"

export type StorefrontPage =
  | "home"
  | "product"
  | "category"
  | "cart"
  | "checkout"
  | "account"
  | "search"
  | "blog"

interface AppState {
  // View system
  currentView: AppView
  setCurrentView: (view: AppView) => void
  
  // Dashboard navigation
  dashboardPage: DashboardPage
  setDashboardPage: (page: DashboardPage) => void
  
  // Admin navigation
  adminPage: AdminPage
  setAdminPage: (page: AdminPage) => void
  
  // Storefront navigation
  storefrontPage: StorefrontPage
  setStorefrontPage: (page: StorefrontPage) => void
  
  // Selected entities
  selectedMerchantId: string | null
  setSelectedMerchantId: (id: string | null) => void
  
  selectedStoreId: string | null
  setSelectedStoreId: (id: string | null) => void
  
  selectedProductId: string | null
  setSelectedProductId: (id: string | null) => void
  
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
  
  selectedCustomerId: string | null
  setSelectedCustomerId: (id: string | null) => void
  
  selectedMerchantAdminId: string | null
  setSelectedMerchantAdminId: (id: string | null) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Auth
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
  
  currentUser: any | null
  setCurrentUser: (user: any | null) => void
  
  // Search
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  setCurrentView: (view) => set({ currentView: view }),
  
  dashboardPage: "overview",
  setDashboardPage: (page) => set({ dashboardPage: page }),
  
  adminPage: "overview",
  setAdminPage: (page) => set({ adminPage: page }),
  
  storefrontPage: "home",
  setStorefrontPage: (page) => set({ storefrontPage: page }),
  
  selectedMerchantId: null,
  setSelectedMerchantId: (id) => set({ selectedMerchantId: id }),
  
  selectedStoreId: null,
  setSelectedStoreId: (id) => set({ selectedStoreId: id }),
  
  selectedProductId: null,
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  
  selectedOrderId: null,
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  
  selectedMerchantAdminId: null,
  setSelectedMerchantAdminId: (id) => set({ selectedMerchantAdminId: id }),
  
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  globalSearchQuery: "",
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
}))
