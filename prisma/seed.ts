import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create subscription plans
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "starter" },
    update: {},
    create: {
      name: "starter",
      displayName: "Starter",
      description: "Perfect for new businesses getting started online",
      price: 29,
      currency: "INR",
      interval: "monthly",
      features: JSON.stringify(["Up to 100 products", "1 staff account", "Basic analytics", "Email support", "1 theme"]),
      limits: JSON.stringify({ products: 100, staff: 1, storage: 1, bandwidth: 50 }),
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "professional" },
    update: {},
    create: {
      name: "professional",
      displayName: "Professional",
      description: "Best for growing businesses with more needs",
      price: 79,
      currency: "INR",
      interval: "monthly",
      features: JSON.stringify(["Unlimited products", "5 staff accounts", "Advanced analytics", "Priority support", "All themes", "AI features", "Custom domain"]),
      limits: JSON.stringify({ products: -1, staff: 5, storage: 10, bandwidth: 500 }),
      sortOrder: 2,
    },
  })

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: "enterprise" },
    update: {},
    create: {
      name: "enterprise",
      displayName: "Enterprise",
      description: "For large-scale operations with advanced needs",
      price: 299,
      currency: "INR",
      interval: "monthly",
      features: JSON.stringify(["Unlimited everything", "Unlimited staff", "Enterprise analytics", "24/7 phone support", "Custom themes", "Full AI suite", "Custom domain", "Priority processing", "Dedicated account manager"]),
      limits: JSON.stringify({ products: -1, staff: -1, storage: 100, bandwidth: -1 }),
      sortOrder: 3,
    },
  })

  console.log("✅ Created subscription plans")

  // Create super admin user
  const adminEmail = "admin@vepar.in"
  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminUser) {
    const adminPasswordHash = await bcrypt.hash("admin123", 10)
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Platform Admin",
        passwordHash: adminPasswordHash,
        role: "super_admin",
        emailVerified: new Date(),
        isActive: true,
      },
    })
    console.log("✅ Created super admin")
  } else {
    console.log("ℹ️ Super admin already exists")
  }

  // Create default themes
  // Modern Theme
  const themesData = [
    {
      name: "Modern Minimal",
      description: "Clean, modern design with emphasis on product imagery",
      config: JSON.stringify({
        colors: { primary: "#1a1a2e", accent: "#e94560", background: "#ffffff", text: "#16213e" },
        fonts: { heading: "Inter", body: "Inter" },
        layout: { headerStyle: "minimal", footerStyle: "standard", productGrid: 3 },
      }),
      isSystem: true,
      isActive: true,
    },
    {
      name: "Bold Commerce",
      description: "Bold, vibrant design for high-energy brands",
      config: JSON.stringify({
        colors: { primary: "#ff6b35", accent: "#004e89", background: "#ffffff", text: "#1a1a2e" },
        fonts: { heading: "Poppins", body: "Inter" },
        layout: { headerStyle: "mega", footerStyle: "extended", productGrid: 4 },
      }),
      isSystem: true,
      isActive: true,
    },
    {
      name: "Elegant Luxe",
      description: "Sophisticated design for premium and luxury brands",
      config: JSON.stringify({
        colors: { primary: "#2d3436", accent: "#d4a574", background: "#fafafa", text: "#2d3436" },
        fonts: { heading: "Playfair Display", body: "Lato" },
        layout: { headerStyle: "elegant", footerStyle: "minimal", productGrid: 3 },
      }),
      isSystem: true,
      isActive: true,
    },
  ]

  for (const theme of themesData) {
    const existing = await prisma.theme.findFirst({ where: { name: theme.name } })
    if (!existing) {
      await prisma.theme.create({ data: theme })
    }
  }

  console.log("✅ Created default themes")

  // Create feature flags
  const featureFlags = [
    { key: "ai_store_builder", name: "AI Store Builder", description: "Allow merchants to build stores using AI", isEnabled: true, rolloutPct: 100 },
    { key: "ai_theme_gen", name: "AI Theme Generator", description: "Generate custom themes with AI", isEnabled: true, rolloutPct: 100 },
    { key: "ai_product_desc", name: "AI Product Descriptions", description: "Auto-generate product descriptions", isEnabled: true, rolloutPct: 100 },
    { key: "ai_seo", name: "AI SEO Generator", description: "Auto-optimize SEO with AI", isEnabled: true, rolloutPct: 100 },
    { key: "ai_marketing", name: "AI Marketing Generator", description: "Generate marketing content with AI", isEnabled: true, rolloutPct: 100 },
    { key: "ai_chat", name: "AI Chat Assistant", description: "AI-powered chat for merchants", isEnabled: true, rolloutPct: 100 },
    { key: "ai_conversion", name: "AI Conversion Optimization", description: "AI-powered conversion rate optimization", isEnabled: false, rolloutPct: 0 },
    { key: "ai_analytics", name: "AI Analytics Insights", description: "AI-generated analytics insights", isEnabled: true, rolloutPct: 100 },
    { key: "ai_workflow", name: "AI Workflow Automation", description: "Automate workflows with AI", isEnabled: false, rolloutPct: 0 },
    { key: "ai_landing_page", name: "AI Landing Page Generator", description: "Generate landing pages with AI", isEnabled: true, rolloutPct: 100 },
    { key: "pwa_support", name: "PWA Support", description: "Progressive Web App support for storefronts", isEnabled: true, rolloutPct: 100 },
    { key: "multi_currency", name: "Multi-Currency", description: "Support multiple currencies in storefront", isEnabled: true, rolloutPct: 100 },
    { key: "multi_language", name: "Multi-Language", description: "Support multiple languages in storefront", isEnabled: true, rolloutPct: 100 },
  ]

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    })
  }

  console.log("✅ Created feature flags")

  // Create app listings
  const apps = [
    { name: "MailForge", slug: "mailforge", description: "Powerful email marketing automation with templates, campaigns, and analytics. Design beautiful emails, segment your audience, and track results.", shortDesc: "Email marketing automation", category: "Marketing", developer: "MailForge Inc.", pricing: JSON.stringify({ free: true, pro: 29, enterprise: 99 }), installs: 15420, rating: 4.7, reviews: 892, status: "active" },
    { name: "SocialSync", slug: "socialsync", description: "Sync your products to social media platforms automatically. Manage Instagram Shop, Facebook Marketplace, and TikTok Shop from one dashboard.", shortDesc: "Social media product sync", category: "Sales Channels", developer: "SocialSync Ltd.", pricing: JSON.stringify({ free: false, pro: 19, enterprise: 79 }), installs: 8750, rating: 4.5, reviews: 432, status: "active" },
    { name: "ReviewForge", slug: "reviewforge", description: "Collect, manage, and showcase customer reviews. Automated review requests, photo reviews, and SEO-rich review snippets.", shortDesc: "Customer review management", category: "Customer Experience", developer: "ReviewForge Co.", pricing: JSON.stringify({ free: true, pro: 15, enterprise: 49 }), installs: 22100, rating: 4.8, reviews: 1243, status: "active" },
    { name: "ShipTracker Pro", slug: "shiptracker-pro", description: "Real-time shipment tracking with automated customer notifications. Supports 1000+ carriers worldwide.", shortDesc: "Shipment tracking & notifications", category: "Shipping", developer: "ShipTracker Inc.", pricing: JSON.stringify({ free: true, pro: 9.99, enterprise: 39 }), installs: 31200, rating: 4.6, reviews: 2100, status: "active" },
    { name: "Accountify", slug: "accountify", description: "Automated accounting, tax reports, and financial analytics. Sync with QuickBooks, Xero, and FreshBooks.", shortDesc: "Accounting & tax automation", category: "Finance", developer: "Accountify Ltd.", pricing: JSON.stringify({ free: false, pro: 25, enterprise: 89 }), installs: 6540, rating: 4.4, reviews: 328, status: "active" },
  ]

  for (const app of apps) {
    await prisma.appListing.upsert({
      where: { slug: app.slug },
      update: {},
      create: app,
    })
  }

  console.log("✅ Created app listings")

  console.log("\n🎉 Seeding complete!")
  console.log("\n📋 Production Super Admin Account:")
  console.log(`  Email: ${adminEmail}`)
  console.log("  Pass:  admin123  <-- CHANGE THIS IMMEDIATELY AFTER LOGIN")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
