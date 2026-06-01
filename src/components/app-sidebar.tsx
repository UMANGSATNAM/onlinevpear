"use client"

import * as React from "react"
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Paintbrush,
  Tag,
  CreditCard,
  BarChart,
  Megaphone,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useAppStore, DashboardPage } from "@/lib/store"

const items: { title: string; id: DashboardPage; icon: any }[] = [
  {
    title: "Overview",
    id: "overview",
    icon: Home,
  },
  {
    title: "Products",
    id: "products",
    icon: Package,
  },
  {
    title: "Orders",
    id: "orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    id: "customers",
    icon: Users,
  },
  {
    title: "Analytics",
    id: "analytics",
    icon: BarChart,
  },
  {
    title: "Marketing",
    id: "marketing",
    icon: Megaphone,
  },
  {
    title: "Discounts",
    id: "discounts",
    icon: Tag,
  },
  {
    title: "Billing",
    id: "billing",
    icon: CreditCard,
  },
  {
    title: "Online Store",
    id: "themes",
    icon: Paintbrush,
  },
  {
    title: "Settings",
    id: "store-settings",
    icon: Settings,
  },
]

export function AppSidebar({ storeName }: { storeName: string }) {
  const { dashboardPage, setDashboardPage } = useAppStore()

  return (
    <Sidebar>
      <SidebarHeader className="border-b h-16 flex items-center px-4 shrink-0">
        <div className="font-bold text-xl truncate">{storeName}</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={dashboardPage === item.id || (dashboardPage === "product-new" && item.id === "products")} 
                    onClick={() => setDashboardPage(item.id)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

