import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create subscription plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "starter",
      displayName: "Starter",
      description: "Perfect for new businesses getting started online",
      price: 29,
      currency: "USD",
      interval: "monthly",
      features: JSON.stringify(["Up to 100 products", "1 staff account", "Basic analytics", "Email support", "1 theme"]),
      limits: JSON.stringify({ products: 100, staff: 1, storage: 1, bandwidth: 50 }),
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "professional",
      displayName: "Professional",
      description: "Best for growing businesses with more needs",
      price: 79,
      currency: "USD",
      interval: "monthly",
      features: JSON.stringify(["Unlimited products", "5 staff accounts", "Advanced analytics", "Priority support", "All themes", "AI features", "Custom domain"]),
      limits: JSON.stringify({ products: -1, staff: 5, storage: 10, bandwidth: 500 }),
      sortOrder: 2,
    },
  })

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: "enterprise",
      displayName: "Enterprise",
      description: "For large-scale operations with advanced needs",
      price: 299,
      currency: "USD",
      interval: "monthly",
      features: JSON.stringify(["Unlimited everything", "Unlimited staff", "Enterprise analytics", "24/7 phone support", "Custom themes", "Full AI suite", "Custom domain", "Priority processing", "Dedicated account manager"]),
      limits: JSON.stringify({ products: -1, staff: -1, storage: 100, bandwidth: -1 }),
      sortOrder: 3,
    },
  })

  console.log("✅ Created subscription plans")

  // Create super admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 10)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@shopforge.io",
      name: "Platform Admin",
      passwordHash: adminPasswordHash,
      role: "super_admin",
      emailVerified: new Date(),
      isActive: true,
    },
  })

  // Create merchant owner user
  const merchantPasswordHash = await bcrypt.hash("merchant123", 10)
  const merchantUser = await prisma.user.create({
    data: {
      email: "merchant@example.com",
      name: "John Merchant",
      passwordHash: merchantPasswordHash,
      role: "user",
      emailVerified: new Date(),
      isActive: true,
    },
  })

  // Create demo customer user
  const customerPasswordHash = await bcrypt.hash("customer123", 10)
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Jane Customer",
      passwordHash: customerPasswordHash,
      role: "user",
      emailVerified: new Date(),
      isActive: true,
    },
  })

  console.log("✅ Created users")

  // Create merchant
  const merchant = await prisma.merchant.create({
    data: {
      businessName: "TechGear Pro",
      email: "merchant@example.com",
      phone: "+1-555-0123",
      domain: "techgearpro.com",
      subdomain: "techgearpro",
      status: "active",
      planId: proPlan.id,
      onboardedAt: new Date(),
      settings: JSON.stringify({
        currency: "USD",
        language: "en",
        timezone: "America/New_York",
        notifications: { email: true, sms: false },
      }),
    },
  })

  // Create merchant-user relation
  await prisma.merchantUser.create({
    data: {
      userId: merchantUser.id,
      merchantId: merchant.id,
      role: "owner",
      acceptedAt: new Date(),
    },
  })

  console.log("✅ Created merchant")

  // Create themes
  const modernTheme = await prisma.theme.create({
    data: {
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
  })

  const boldTheme = await prisma.theme.create({
    data: {
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
  })

  const elegantTheme = await prisma.theme.create({
    data: {
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
  })

  console.log("✅ Created themes")

  // Create store
  const store = await prisma.store.create({
    data: {
      merchantId: merchant.id,
      name: "TechGear Pro",
      slug: "techgearpro",
      description: "Premium tech accessories and gadgets for the modern professional",
      domain: "techgearpro.com",
      subdomain: "techgearpro",
      status: "active",
      themeId: modernTheme.id,
      currency: "USD",
      language: "en",
      timezone: "America/New_York",
      seo: JSON.stringify({ title: "TechGear Pro - Premium Tech Accessories", description: "Shop the latest in tech accessories and gadgets" }),
      settings: JSON.stringify({ showOutOfStock: true, allowPreorder: false, reviewsEnabled: true }),
    },
  })

  console.log("✅ Created store")

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { storeId: store.id, name: "Audio", slug: "audio", description: "Headphones, speakers, and audio accessories", sortOrder: 1 } }),
    prisma.category.create({ data: { storeId: store.id, name: "Wearables", slug: "wearables", description: "Smartwatches and fitness trackers", sortOrder: 2 } }),
    prisma.category.create({ data: { storeId: store.id, name: "Accessories", slug: "accessories", description: "Phone cases, chargers, and cables", sortOrder: 3 } }),
    prisma.category.create({ data: { storeId: store.id, name: "Computing", slug: "computing", description: "Laptops, monitors, and peripherals", sortOrder: 4 } }),
    prisma.category.create({ data: { storeId: store.id, name: "Smart Home", slug: "smart-home", description: "Smart speakers, lights, and home automation", sortOrder: 5 } }),
    prisma.category.create({ data: { storeId: store.id, name: "Cameras", slug: "cameras", description: "Digital cameras, action cams, and accessories", sortOrder: 6 } }),
  ])

  console.log("✅ Created categories")

  // Create products
  const products = [
    {
      name: "ProSound Elite Headphones",
      slug: "prosound-elite-headphones",
      description: "Experience premium audio with active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for music lovers and professionals who demand the best sound quality.",
      shortDesc: "Premium ANC headphones with 40-hour battery",
      sku: "PSE-001",
      price: 299.99,
      comparePrice: 399.99,
      costPrice: 120,
      categoryId: categories[0].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/headphones-1.jpg"]),
      weight: 0.35,
      tags: JSON.stringify(["headphones", "audio", "ANC", "premium"]),
    },
    {
      name: "FitBand Ultra Smartwatch",
      slug: "fitband-ultra-smartwatch",
      description: "Track your health and fitness with GPS, heart rate monitoring, SpO2, sleep tracking, and 100+ workout modes. Water resistant to 50m with a stunning AMOLED display.",
      shortDesc: "Advanced fitness smartwatch with GPS & AMOLED",
      sku: "FBU-002",
      price: 199.99,
      comparePrice: 249.99,
      costPrice: 75,
      categoryId: categories[1].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/smartwatch-1.jpg"]),
      weight: 0.05,
      tags: JSON.stringify(["smartwatch", "fitness", "GPS", "health"]),
    },
    {
      name: "MagCharge 3-in-1 Station",
      slug: "magcharge-3in1-station",
      description: "Charge your iPhone, Apple Watch, and AirPods simultaneously with this sleek magnetic charging station. Features Qi2 technology and ambient night light.",
      shortDesc: "3-in-1 magnetic wireless charging station",
      sku: "MC3-003",
      price: 79.99,
      comparePrice: 99.99,
      costPrice: 28,
      categoryId: categories[2].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/charger-1.jpg"]),
      weight: 0.4,
      tags: JSON.stringify(["charger", "wireless", "magnetic", "3-in-1"]),
    },
    {
      name: "SlimArmor Pro Case",
      slug: "slimarmor-pro-case",
      description: "Military-grade drop protection in a slim, elegant design. Features antimicrobial coating, raised bezels for camera protection, and wireless charging compatibility.",
      shortDesc: "Military-grade protection, slim design",
      sku: "SAP-004",
      price: 34.99,
      comparePrice: 49.99,
      costPrice: 8,
      categoryId: categories[2].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/phone-case-1.jpg"]),
      weight: 0.04,
      tags: JSON.stringify(["case", "protection", "phone", "slim"]),
    },
    {
      name: "CloudBook Air 14",
      slug: "cloudbook-air-14",
      description: "Ultra-thin 14\" laptop with M3 chip, 16GB RAM, 512GB SSD, and 18-hour battery life. Perfect for professionals on the go.",
      shortDesc: "Ultra-thin 14\" laptop with M3 chip",
      sku: "CBA-005",
      price: 1299.99,
      comparePrice: 1499.99,
      costPrice: 850,
      categoryId: categories[3].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/laptop-1.jpg"]),
      weight: 1.24,
      tags: JSON.stringify(["laptop", "ultrabook", "M3", "professional"]),
    },
    {
      name: "HomeHub Max Speaker",
      slug: "homehub-max-speaker",
      description: "Premium smart speaker with room-filling sound, built-in voice assistant, multi-room audio support, and smart home hub functionality.",
      shortDesc: "Premium smart speaker & home hub",
      sku: "HHM-006",
      price: 149.99,
      comparePrice: 199.99,
      costPrice: 55,
      categoryId: categories[4].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/speaker-1.jpg"]),
      weight: 1.1,
      tags: JSON.stringify(["speaker", "smart-home", "voice-assistant", "audio"]),
    },
    {
      name: "ActionCam 4K Pro",
      slug: "actioncam-4k-pro",
      description: "Shoot stunning 4K120fps video with HyperSmooth stabilization, waterproof to 33ft, and live streaming capability. The ultimate action camera.",
      shortDesc: "4K120fps action camera with stabilization",
      sku: "AC4-007",
      price: 399.99,
      comparePrice: 499.99,
      costPrice: 180,
      categoryId: categories[5].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/camera-1.jpg"]),
      weight: 0.15,
      tags: JSON.stringify(["camera", "4K", "action", "waterproof"]),
    },
    {
      name: "ErgoDesk Pro Standing Desk",
      slug: "ergodesk-pro-standing-desk",
      description: "Electric standing desk with memory presets, cable management, and bamboo desktop. Adjusts from 28\" to 48\" height silently.",
      shortDesc: "Electric standing desk with memory presets",
      sku: "EDP-008",
      price: 599.99,
      comparePrice: 799.99,
      costPrice: 250,
      categoryId: categories[3].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/desk-1.jpg"]),
      weight: 35,
      tags: JSON.stringify(["desk", "standing", "ergonomic", "office"]),
    },
    {
      name: "USB-C Nano Charger 65W",
      slug: "usbc-nano-charger-65w",
      description: "Ultra-compact GaN charger with 65W output, enough to fast-charge laptops. Features foldable prongs and dual USB-C ports.",
      shortDesc: "Ultra-compact 65W GaN charger",
      sku: "UCN-009",
      price: 39.99,
      comparePrice: 54.99,
      costPrice: 12,
      categoryId: categories[2].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/charger-usb-c.jpg"]),
      weight: 0.1,
      tags: JSON.stringify(["charger", "USB-C", "GaN", "fast-charge"]),
    },
    {
      name: "SmartBud Pro Earbuds",
      slug: "smartbud-pro-earbuds",
      description: "True wireless earbuds with adaptive ANC, Hi-Res Audio, 30-hour total battery, and IPX5 water resistance. Crystal clear calls with 6 microphones.",
      shortDesc: "Premium TWS earbuds with adaptive ANC",
      sku: "SBP-010",
      price: 149.99,
      comparePrice: 199.99,
      costPrice: 50,
      categoryId: categories[0].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/earbuds-1.jpg"]),
      weight: 0.06,
      tags: JSON.stringify(["earbuds", "TWS", "ANC", "wireless"]),
    },
    {
      name: "MechKey 75% Keyboard",
      slug: "mechkey-75-keyboard",
      description: "Premium mechanical keyboard with hot-swappable switches, RGB backlighting, gasket mount design, and PBT keycaps. Available in multiple switch types.",
      shortDesc: "Premium 75% mechanical keyboard",
      sku: "MK7-011",
      price: 129.99,
      comparePrice: 159.99,
      costPrice: 45,
      categoryId: categories[3].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/keyboard-1.jpg"]),
      weight: 0.8,
      tags: JSON.stringify(["keyboard", "mechanical", "RGB", "75%"]),
    },
    {
      name: "SmartLock Pro",
      slug: "smartlock-pro",
      description: "Keyless entry smart lock with fingerprint, PIN, app, and key access. Auto-lock, guest codes, and activity logs. Works with major smart home platforms.",
      shortDesc: "Fingerprint smart lock with multi-access",
      sku: "SLP-012",
      price: 249.99,
      comparePrice: 299.99,
      costPrice: 95,
      categoryId: categories[4].id,
      type: "physical",
      status: "active",
      images: JSON.stringify(["/products/smartlock-1.jpg"]),
      weight: 1.5,
      tags: JSON.stringify(["smart-lock", "fingerprint", "home-security"]),
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        storeId: store.id,
        ...product,
        publishedAt: new Date(),
        seo: JSON.stringify({ title: product.name, description: product.shortDesc }),
        meta: JSON.stringify({}),
        dimensions: JSON.stringify({ length: 0, width: 0, height: 0, unit: "cm" }),
      },
    })
    createdProducts.push(created)

    // Create inventory for each product
    await prisma.inventory.create({
      data: {
        productId: created.id,
        quantity: Math.floor(Math.random() * 200) + 20,
        reserved: Math.floor(Math.random() * 10),
        location: "Warehouse A",
        lowStockThreshold: 10,
      },
    })

    // Create product variants for some products
    if (["SAP-004", "MK7-011"].includes(product.sku)) {
      const variantOptions = product.sku === "SAP-004"
        ? [{ title: "Midnight Black", options: JSON.stringify({ color: "Black" }) }, { title: "Arctic White", options: JSON.stringify({ color: "White" }) }, { title: "Navy Blue", options: JSON.stringify({ color: "Navy" }) }]
        : [{ title: "Linear Switch", options: JSON.stringify({ switch: "Linear" }) }, { title: "Tactile Switch", options: JSON.stringify({ switch: "Tactile" }) }, { title: "Clicky Switch", options: JSON.stringify({ switch: "Clicky" }) }]
      
      for (const variant of variantOptions) {
        const v = await prisma.productVariant.create({
          data: {
            productId: created.id,
            title: variant.title,
            options: variant.options,
            price: product.price,
            comparePrice: product.comparePrice,
            costPrice: product.costPrice,
            sku: `${product.sku}-${variant.title.toLowerCase().replace(/\s+/g, '-')}`,
            isActive: true,
          },
        })
        await prisma.inventory.create({
          data: {
            productId: created.id,
            variantId: v.id,
            quantity: Math.floor(Math.random() * 100) + 10,
            location: "Warehouse A",
            lowStockThreshold: 5,
          },
        })
      }
    }
  }

  console.log("✅ Created products with inventory and variants")

  // Create customers
  const customerNames = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
    { name: "Carol Williams", email: "carol@example.com" },
    { name: "David Brown", email: "david@example.com" },
    { name: "Eva Martinez", email: "eva@example.com" },
    { name: "Frank Davis", email: "frank@example.com" },
    { name: "Grace Wilson", email: "grace@example.com" },
    { name: "Henry Taylor", email: "henry@example.com" },
    { name: "Ivy Anderson", email: "ivy@example.com" },
    { name: "Jack Thomas", email: "jack@example.com" },
    { name: "Karen Jackson", email: "karen@example.com" },
    { name: "Leo White", email: "leo@example.com" },
    { name: "Mia Harris", email: "mia@example.com" },
    { name: "Noah Martin", email: "noah@example.com" },
    { name: "Olivia Garcia", email: "olivia@example.com" },
  ]

  const createdCustomers = []
  for (const c of customerNames) {
    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        merchantId: merchant.id,
        email: c.email,
        name: c.name,
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        addresses: JSON.stringify([{
          street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
          state: ["NY", "CA", "IL", "TX", "AZ"][Math.floor(Math.random() * 5)],
          zip: String(Math.floor(Math.random() * 90000) + 10000),
          country: "US",
          isDefault: true,
        }]),
        totalOrders: Math.floor(Math.random() * 15) + 1,
        totalSpent: Math.floor(Math.random() * 5000) + 100,
        avgOrderValue: Math.floor(Math.random() * 200) + 50,
        lastOrderAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: "active",
        tags: JSON.stringify(["vip", "repeat-buyer"].slice(0, Math.floor(Math.random() * 2) + 1)),
      },
    })
    createdCustomers.push(customer)
  }

  console.log("✅ Created customers")

  // Create orders
  const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
  const paymentStatuses = ["pending", "paid", "failed", "refunded"]

  for (let i = 0; i < 30; i++) {
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)]
    const numItems = Math.floor(Math.random() * 3) + 1
    const orderProducts = []
    let subtotal = 0

    for (let j = 0; j < numItems; j++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      orderProducts.push({ product, quantity })
      subtotal += product.price * quantity
    }

    const taxRate = 0.08
    const shippingCost = subtotal > 100 ? 0 : 9.99
    const discountAmount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0
    const total = subtotal + (subtotal * taxRate) + shippingCost - discountAmount

    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    const placedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customer.id,
        orderNumber: `ORD-${String(1000 + i).padStart(5, '0')}`,
        status,
        paymentStatus: status === "cancelled" ? "failed" : (status === "delivered" ? "paid" : paymentStatuses[Math.floor(Math.random() * 2)]),
        fulfillmentStatus: status === "delivered" ? "fulfilled" : (status === "shipped" ? "partial" : "unfulfilled"),
        subtotal,
        taxTotal: subtotal * taxRate,
        shippingTotal: shippingCost,
        discountTotal: discountAmount,
        total,
        currency: "USD",
        shippingAddress: customer.addresses,
        billingAddress: customer.addresses,
        shippingMethod: shippingCost === 0 ? "Free Shipping" : "Standard Shipping",
        placedAt,
        confirmedAt: status !== "pending" ? new Date(placedAt.getTime() + 3600000) : undefined,
        shippedAt: ["shipped", "delivered"].includes(status) ? new Date(placedAt.getTime() + 86400000) : undefined,
        deliveredAt: status === "delivered" ? new Date(placedAt.getTime() + 3 * 86400000) : undefined,
        cancelledAt: status === "cancelled" ? new Date(placedAt.getTime() + 7200000) : undefined,
      },
    })

    for (const item of orderProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        },
      })
    }

    // Create payment for paid orders
    if (order.paymentStatus === "paid") {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: ["card", "wallet", "bank_transfer"][Math.floor(Math.random() * 3)],
          gateway: "stripe",
          amount: total,
          currency: "USD",
          status: "completed",
          processedAt: placedAt,
        },
      })
    }
  }

  console.log("✅ Created orders with items and payments")

  // Create shipping methods
  await Promise.all([
    prisma.shippingMethod.create({ data: { storeId: store.id, name: "Standard Shipping", description: "5-7 business days", price: 9.99, freeAbove: 100, estimatedDays: "5-7", isActive: true, sortOrder: 1 } }),
    prisma.shippingMethod.create({ data: { storeId: store.id, name: "Express Shipping", description: "2-3 business days", price: 19.99, freeAbove: 200, estimatedDays: "2-3", isActive: true, sortOrder: 2 } }),
    prisma.shippingMethod.create({ data: { storeId: store.id, name: "Overnight Shipping", description: "Next business day", price: 39.99, freeAbove: 500, estimatedDays: "1", isActive: true, sortOrder: 3 } }),
    prisma.shippingMethod.create({ data: { storeId: store.id, name: "Free Shipping", description: "7-10 business days", price: 0, freeAbove: 50, estimatedDays: "7-10", isActive: true, sortOrder: 4 } }),
  ])

  // Create tax rates
  await Promise.all([
    prisma.taxRate.create({ data: { storeId: store.id, name: "US Standard", rate: 0.08, country: "US", isActive: true } }),
    prisma.taxRate.create({ data: { storeId: store.id, name: "California", rate: 0.0925, country: "US", region: "CA", isActive: true } }),
    prisma.taxRate.create({ data: { storeId: store.id, name: "New York", rate: 0.08875, country: "US", region: "NY", isActive: true } }),
    prisma.taxRate.create({ data: { storeId: store.id, name: "EU VAT Standard", rate: 0.20, country: "GB", isActive: true } }),
  ])

  // Create discounts
  await Promise.all([
    prisma.discount.create({ data: { storeId: store.id, code: "WELCOME10", type: "percentage", value: 10, minOrderValue: 50, usageLimit: 1000, usageCount: 234, startsAt: new Date("2024-01-01"), endsAt: new Date("2025-12-31"), isActive: true } }),
    prisma.discount.create({ data: { storeId: store.id, code: "SAVE20", type: "percentage", value: 20, minOrderValue: 100, maxDiscount: 50, usageLimit: 500, usageCount: 89, startsAt: new Date("2024-06-01"), endsAt: new Date("2025-06-30"), isActive: true } }),
    prisma.discount.create({ data: { storeId: store.id, code: "FLAT25", type: "fixed_amount", value: 25, minOrderValue: 150, usageLimit: 200, usageCount: 45, startsAt: new Date("2024-03-01"), endsAt: new Date("2025-03-31"), isActive: true } }),
    prisma.discount.create({ data: { storeId: store.id, code: "FREESHIP", type: "free_shipping", value: 0, minOrderValue: 75, usageLimit: 2000, usageCount: 567, startsAt: new Date("2024-01-01"), endsAt: new Date("2025-12-31"), isActive: true } }),
  ])

  console.log("✅ Created shipping methods, tax rates, and discounts")

  // Create store pages
  await Promise.all([
    prisma.storePage.create({ data: { storeId: store.id, title: "Home", slug: "home", content: JSON.stringify({ blocks: [{ type: "hero", title: "Welcome to TechGear Pro", subtitle: "Premium tech accessories for the modern professional", cta: "Shop Now" }] }), status: "published", isHomepage: true, sortOrder: 0 } }),
    prisma.storePage.create({ data: { storeId: store.id, title: "About Us", slug: "about", content: JSON.stringify({ blocks: [{ type: "text", content: "We are dedicated to bringing you the best tech accessories." }] }), status: "published", sortOrder: 1 } }),
    prisma.storePage.create({ data: { storeId: store.id, title: "Contact", slug: "contact", content: JSON.stringify({ blocks: [{ type: "text", content: "Get in touch with our team." }] }), status: "published", sortOrder: 2 } }),
  ])

  // Create blogs
  await Promise.all([
    prisma.blog.create({ data: { storeId: store.id, title: "10 Must-Have Tech Accessories for 2025", slug: "must-have-tech-2025", content: "The tech world is evolving rapidly, and staying ahead means having the right accessories. Here are our top picks for 2025...", excerpt: "Stay ahead with the latest tech accessories", author: "TechGear Team", tags: JSON.stringify(["tech", "accessories", "2025"]), status: "published", publishedAt: new Date() } }),
    prisma.blog.create({ data: { storeId: store.id, title: "How to Choose the Perfect Headphones", slug: "choose-perfect-headphones", content: "With so many options on the market, finding the right headphones can be overwhelming. This guide breaks down everything you need to know...", excerpt: "Your complete guide to finding the right headphones", author: "Audio Expert", tags: JSON.stringify(["headphones", "guide", "audio"]), status: "published", publishedAt: new Date() } }),
    prisma.blog.create({ data: { storeId: store.id, title: "Smart Home Setup: A Beginner's Guide", slug: "smart-home-beginner-guide", content: "Transform your home into a smart home with our comprehensive beginner's guide. We cover everything from smart speakers to security systems...", excerpt: "Start your smart home journey today", author: "Smart Home Pro", tags: JSON.stringify(["smart-home", "guide", "beginner"]), status: "published", publishedAt: new Date() } }),
  ])

  console.log("✅ Created pages and blogs")

  // Create feature flags
  await Promise.all([
    prisma.featureFlag.create({ data: { key: "ai_store_builder", name: "AI Store Builder", description: "Allow merchants to build stores using AI", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "ai_theme_gen", name: "AI Theme Generator", description: "Generate custom themes with AI", isEnabled: true, rolloutPct: 80 } }),
    prisma.featureFlag.create({ data: { key: "ai_product_desc", name: "AI Product Descriptions", description: "Auto-generate product descriptions", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "ai_seo", name: "AI SEO Generator", description: "Auto-optimize SEO with AI", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "ai_marketing", name: "AI Marketing Generator", description: "Generate marketing content with AI", isEnabled: true, rolloutPct: 60 } }),
    prisma.featureFlag.create({ data: { key: "ai_chat", name: "AI Chat Assistant", description: "AI-powered chat for merchants", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "ai_conversion", name: "AI Conversion Optimization", description: "AI-powered conversion rate optimization", isEnabled: false, rolloutPct: 30 } }),
    prisma.featureFlag.create({ data: { key: "ai_analytics", name: "AI Analytics Insights", description: "AI-generated analytics insights", isEnabled: true, rolloutPct: 75 } }),
    prisma.featureFlag.create({ data: { key: "ai_workflow", name: "AI Workflow Automation", description: "Automate workflows with AI", isEnabled: false, rolloutPct: 20 } }),
    prisma.featureFlag.create({ data: { key: "ai_landing_page", name: "AI Landing Page Generator", description: "Generate landing pages with AI", isEnabled: true, rolloutPct: 50 } }),
    prisma.featureFlag.create({ data: { key: "pwa_support", name: "PWA Support", description: "Progressive Web App support for storefronts", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "multi_currency", name: "Multi-Currency", description: "Support multiple currencies in storefront", isEnabled: true, rolloutPct: 100 } }),
    prisma.featureFlag.create({ data: { key: "multi_language", name: "Multi-Language", description: "Support multiple languages in storefront", isEnabled: true, rolloutPct: 80 } }),
  ])

  console.log("✅ Created feature flags")

  // Create app listings
  await Promise.all([
    prisma.appListing.create({ data: { name: "MailForge", slug: "mailforge", description: "Powerful email marketing automation with templates, campaigns, and analytics. Design beautiful emails, segment your audience, and track results.", shortDesc: "Email marketing automation", category: "Marketing", developer: "MailForge Inc.", pricing: JSON.stringify({ free: true, pro: 29, enterprise: 99 }), installs: 15420, rating: 4.7, reviews: 892, status: "active" } }),
    prisma.appListing.create({ data: { name: "SocialSync", slug: "socialsync", description: "Sync your products to social media platforms automatically. Manage Instagram Shop, Facebook Marketplace, and TikTok Shop from one dashboard.", shortDesc: "Social media product sync", category: "Sales Channels", developer: "SocialSync Ltd.", pricing: JSON.stringify({ free: false, pro: 19, enterprise: 79 }), installs: 8750, rating: 4.5, reviews: 432, status: "active" } }),
    prisma.appListing.create({ data: { name: "ReviewForge", slug: "reviewforge", description: "Collect, manage, and showcase customer reviews. Automated review requests, photo reviews, and SEO-rich review snippets.", shortDesc: "Customer review management", category: "Customer Experience", developer: "ReviewForge Co.", pricing: JSON.stringify({ free: true, pro: 15, enterprise: 49 }), installs: 22100, rating: 4.8, reviews: 1243, status: "active" } }),
    prisma.appListing.create({ data: { name: "ShipTracker Pro", slug: "shiptracker-pro", description: "Real-time shipment tracking with automated customer notifications. Supports 1000+ carriers worldwide.", shortDesc: "Shipment tracking & notifications", category: "Shipping", developer: "ShipTracker Inc.", pricing: JSON.stringify({ free: true, pro: 9.99, enterprise: 39 }), installs: 31200, rating: 4.6, reviews: 2100, status: "active" } }),
    prisma.appListing.create({ data: { name: "Accountify", slug: "accountify", description: "Automated accounting, tax reports, and financial analytics. Sync with QuickBooks, Xero, and FreshBooks.", shortDesc: "Accounting & tax automation", category: "Finance", developer: "Accountify Ltd.", pricing: JSON.stringify({ free: false, pro: 25, enterprise: 89 }), installs: 6540, rating: 4.4, reviews: 328, status: "active" } }),
  ])

  console.log("✅ Created app listings")

  // Create subscriptions and invoices
  const subscription = await prisma.subscription.create({
    data: {
      merchantId: merchant.id,
      planId: proPlan.id,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  for (let i = 0; i < 6; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    await prisma.invoice.create({
      data: {
        merchantId: merchant.id,
        subscriptionId: subscription.id,
        amount: 79,
        currency: "USD",
        status: i === 0 ? "pending" : "paid",
        invoiceNumber: `INV-${String(2024000 + i).padStart(8, '0')}`,
        dueDate: date,
        paidAt: i > 0 ? date : undefined,
        lineItems: JSON.stringify([{ description: "Professional Plan - Monthly", amount: 79 }]),
      },
    })
  }

  console.log("✅ Created subscriptions and invoices")

  // Create workflows
  await Promise.all([
    prisma.workflow.create({ data: { merchantId: merchant.id, name: "Welcome Email", description: "Send welcome email to new customers", trigger: "customer_created", conditions: JSON.stringify([]), actions: JSON.stringify([{ type: "send_email", template: "welcome", to: "{{customer.email}}" }]), isActive: true, runCount: 15 } }),
    prisma.workflow.create({ data: { merchantId: merchant.id, name: "Low Stock Alert", description: "Notify when product stock is low", trigger: "low_stock", conditions: JSON.stringify([{ field: "quantity", operator: "less_than", value: 10 }]), actions: JSON.stringify([{ type: "send_notification", message: "Product {{product.name}} is low on stock" }]), isActive: true, runCount: 3 } }),
    prisma.workflow.create({ data: { merchantId: merchant.id, name: "Order Confirmation", description: "Send order confirmation email", trigger: "order_created", conditions: JSON.stringify([]), actions: JSON.stringify([{ type: "send_email", template: "order_confirmation", to: "{{order.customer.email}}" }]), isActive: true, runCount: 30 } }),
    prisma.workflow.create({ data: { merchantId: merchant.id, name: "Shipping Update", description: "Notify customer when order ships", trigger: "order_shipped", conditions: JSON.stringify([]), actions: JSON.stringify([{ type: "send_email", template: "shipping_update", to: "{{order.customer.email}}" }]), isActive: true, runCount: 22 } }),
  ])

  console.log("✅ Created workflows")

  // Create email templates
  await Promise.all([
    prisma.emailTemplate.create({ data: { merchantId: merchant.id, name: "Order Confirmation", subject: "Your order #{{orderNumber}} is confirmed!", body: "Hi {{customer.name}}, your order #{{orderNumber}} has been confirmed.", type: "transactional" } }),
    prisma.emailTemplate.create({ data: { merchantId: merchant.id, name: "Shipping Update", subject: "Your order #{{orderNumber}} has shipped!", body: "Hi {{customer.name}}, your order #{{orderNumber}} is on its way!", type: "transactional" } }),
    prisma.emailTemplate.create({ data: { merchantId: merchant.id, name: "Welcome Email", subject: "Welcome to {{store.name}}!", body: "Hi {{customer.name}}, welcome to our store! Enjoy 10% off your first order with code WELCOME10.", type: "marketing" } }),
  ])

  console.log("✅ Created email templates")

  // Create AI usage records
  const aiFeatures = ["store_builder", "theme_gen", "product_desc", "seo", "marketing", "chat", "analytics"]
  for (let i = 0; i < 50; i++) {
    await prisma.aiUsage.create({
      data: {
        merchantId: merchant.id,
        feature: aiFeatures[Math.floor(Math.random() * aiFeatures.length)],
        model: "gpt-4",
        inputTokens: Math.floor(Math.random() * 2000) + 100,
        outputTokens: Math.floor(Math.random() * 1000) + 50,
        totalTokens: Math.floor(Math.random() * 3000) + 150,
        cost: Math.random() * 0.15 + 0.01,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("✅ Created AI usage records")

  // Create analytics events
  const eventTypes = ["page_view", "product_view", "add_to_cart", "checkout_started", "purchase", "search"]
  for (let i = 0; i < 200; i++) {
    await prisma.analyticsEvent.create({
      data: {
        merchantId: merchant.id,
        storeId: store.id,
        event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        data: JSON.stringify({ page: ["/", "/products", "/cart", "/checkout"][Math.floor(Math.random() * 4)] }),
        sessionId: `sess-${Math.floor(Math.random() * 1000)}`,
        url: ["/", "/products/prosound-elite", "/cart", "/checkout"][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("✅ Created analytics events")

  // Create collections
  await Promise.all([
    prisma.collection.create({ data: { storeId: store.id, name: "New Arrivals", slug: "new-arrivals", description: "Our latest products", type: "manual", isActive: true, sortOrder: 1 } }),
    prisma.collection.create({ data: { storeId: store.id, name: "Best Sellers", slug: "best-sellers", description: "Our most popular items", type: "automated", rules: JSON.stringify([{ field: "sales_count", operator: "greater_than", value: 10 }]), isActive: true, sortOrder: 2 } }),
    prisma.collection.create({ data: { storeId: store.id, name: "Under $50", slug: "under-50", description: "Great deals under $50", type: "automated", rules: JSON.stringify([{ field: "price", operator: "less_than", value: 50 }]), isActive: true, sortOrder: 3 } }),
    prisma.collection.create({ data: { storeId: store.id, name: "Premium", slug: "premium", description: "Our premium selection", type: "manual", isActive: true, sortOrder: 4 } }),
  ])

  console.log("✅ Created collections")

  // Create reviews for products
  for (let i = 0; i < 25; i++) {
    const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)]
    await prisma.review.create({
      data: {
        productId: product.id,
        customerId: customer.id,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        title: ["Great product!", "Love it!", "Good quality", "Excellent!", "Very happy"][Math.floor(Math.random() * 5)],
        content: ["This is exactly what I needed. Works perfectly.", "Amazing quality for the price. Would recommend.", "Solid product, fast shipping. Very satisfied.", "Best purchase I've made this year.", "Good value for money, meets expectations."][Math.floor(Math.random() * 5)],
        status: "approved",
        isVerified: Math.random() > 0.3,
      },
    })
  }

  console.log("✅ Created reviews")

  // Create audit logs
  const auditActions = ["user.login", "product.create", "product.update", "order.create", "order.update", "merchant.update", "settings.update", "user.create"]
  for (let i = 0; i < 40; i++) {
    await prisma.auditLog.create({
      data: {
        userId: i % 3 === 0 ? adminUser.id : merchantUser.id,
        merchantId: i % 3 !== 0 ? merchant.id : undefined,
        action: auditActions[Math.floor(Math.random() * auditActions.length)],
        resource: ["User", "Product", "Order", "Merchant", "Settings"][Math.floor(Math.random() * 5)],
        resourceId: `res-${Math.floor(Math.random() * 100)}`,
        details: JSON.stringify({ ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log("✅ Created audit logs")
  console.log("\n🎉 Seeding complete!")
  console.log("\n📋 Test Accounts:")
  console.log("  Super Admin: admin@shopforge.io / admin123")
  console.log("  Merchant:    merchant@example.com / merchant123")
  console.log("  Customer:    customer@example.com / customer123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
