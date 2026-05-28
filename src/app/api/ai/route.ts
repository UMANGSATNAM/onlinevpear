import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZaiSdk from 'z-ai-web-dev-sdk'

const sdk = new ZaiSdk()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feature, prompt, context, merchantId } = body

    if (!feature || !prompt) {
      return NextResponse.json(
        { error: 'feature and prompt are required' },
        { status: 400 }
      )
    }

    const allowedFeatures = [
      'store_builder', 'theme_gen', 'product_desc', 'seo',
      'marketing', 'chat', 'conversion', 'analytics',
      'workflow', 'landing_page',
    ]

    if (!allowedFeatures.includes(feature)) {
      return NextResponse.json(
        { error: `Invalid feature. Allowed: ${allowedFeatures.join(', ')}` },
        { status: 400 }
      )
    }

    // Build system prompt based on feature
    const systemPrompts: Record<string, string> = {
      store_builder: 'You are an expert ecommerce store designer. Help create store configurations, layouts, and settings.',
      theme_gen: 'You are an expert frontend developer specializing in ecommerce themes. Generate theme configurations, CSS, and layout designs.',
      product_desc: 'You are an expert copywriter for ecommerce products. Write compelling, SEO-optimized product descriptions.',
      seo: 'You are an SEO expert for ecommerce. Provide optimization recommendations for meta titles, descriptions, and content.',
      marketing: 'You are an ecommerce marketing expert. Create marketing strategies, email campaigns, and promotional content.',
      chat: 'You are a helpful AI assistant for an ecommerce platform. Help merchants with their questions about running their online store.',
      conversion: 'You are a conversion rate optimization expert. Analyze and suggest improvements to increase sales.',
      analytics: 'You are a data analyst specializing in ecommerce. Interpret metrics and provide actionable insights.',
      workflow: 'You are an automation expert. Design workflow automations for ecommerce operations.',
      landing_page: 'You are a landing page expert. Create high-converting landing page content and layouts.',
    }

    const systemPrompt = systemPrompts[feature] || 'You are a helpful AI assistant for an ecommerce platform.'

    const messages = [
      { role: 'system' as const, content: systemPrompt },
    ]

    if (context) {
      messages.push({ role: 'system' as const, content: `Context: ${JSON.stringify(context)}` })
    }

    messages.push({ role: 'user' as const, content: prompt })

    const response = await sdk.chat({ messages })

    const result = response.choices?.[0]?.message?.content || ''

    // Track AI usage
    if (merchantId) {
      await db.aiUsage.create({
        data: {
          merchantId,
          feature,
          model: 'default',
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
          cost: 0,
          metadata: JSON.stringify({ promptLength: prompt.length }),
        },
      })
    }

    return NextResponse.json({
      result,
      feature,
      usage: response.usage || null,
    })
  } catch (error) {
    console.error('AI POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')
    const period = searchParams.get('period') || '30d'

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get usage stats
    const usageRecords = await db.aiUsage.findMany({
      where: {
        merchantId,
        createdAt: { gte: startDate },
      },
    })

    const totalTokens = usageRecords.reduce((sum, r) => sum + r.totalTokens, 0)
    const totalCost = usageRecords.reduce((sum, r) => sum + r.cost, 0)
    const totalRequests = usageRecords.length

    // Usage by feature
    const byFeature: Record<string, { requests: number; tokens: number; cost: number }> = {}
    usageRecords.forEach((r) => {
      if (!byFeature[r.feature]) {
        byFeature[r.feature] = { requests: 0, tokens: 0, cost: 0 }
      }
      byFeature[r.feature].requests += 1
      byFeature[r.feature].tokens += r.totalTokens
      byFeature[r.feature].cost += r.cost
    })

    // Daily usage for chart
    const dailyUsage: Record<string, { requests: number; tokens: number }> = {}
    usageRecords.forEach((r) => {
      const day = r.createdAt.toISOString().split('T')[0]
      if (!dailyUsage[day]) {
        dailyUsage[day] = { requests: 0, tokens: 0 }
      }
      dailyUsage[day].requests += 1
      dailyUsage[day].tokens += r.totalTokens
    })

    return NextResponse.json({
      stats: {
        totalRequests,
        totalTokens,
        totalCost,
        period,
      },
      byFeature,
      dailyUsage,
    })
  } catch (error) {
    console.error('AI usage GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
