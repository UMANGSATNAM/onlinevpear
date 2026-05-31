import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let sdkInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getSdk() {
  if (!sdkInstance) {
    sdkInstance = await ZAI.create()
  }
  return sdkInstance
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeName, storeDescription, type } = body

    if (!storeName) {
      return NextResponse.json(
        { error: 'storeName is required' },
        { status: 400 }
      )
    }

    const isTitle = type === 'title'
    const isDescription = type === 'description'
    const isBoth = !isTitle && !isDescription

    let metaTitle = ''
    let metaDescription = ''

    try {
      const sdk = await getSdk()
      const prompt = isBoth
        ? `Generate an SEO-optimized meta title (max 60 characters) and meta description (max 160 characters) for an ecommerce store named "${storeName}". ${storeDescription ? `Store description: ${storeDescription}` : ''} Return ONLY a JSON object with "title" and "description" fields, no other text.`
        : isTitle
          ? `Generate an SEO-optimized meta title (max 60 characters) for an ecommerce store named "${storeName}". ${storeDescription ? `Store description: ${storeDescription}` : ''} Return ONLY the title text, no quotes, no labels, no preamble.`
          : `Generate an SEO-optimized meta description (max 160 characters) for an ecommerce store named "${storeName}". ${storeDescription ? `Store description: ${storeDescription}` : ''} Return ONLY the description text, no quotes, no labels, no preamble.`

      const response = await sdk.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an SEO expert for ecommerce stores. Generate concise, keyword-rich meta titles and descriptions. Always stay within character limits: 60 for titles, 160 for descriptions. Do not include any preamble or explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: { type: 'disabled' },
      })

      const result = response.choices?.[0]?.message?.content || ''

      if (isBoth) {
        try {
          const parsed = JSON.parse(result)
          metaTitle = parsed.title || ''
          metaDescription = parsed.description || ''
        } catch {
          // Try to extract from text
          const titleMatch = result.match(/"title"\s*:\s*"([^"]+)"/)
          const descMatch = result.match(/"description"\s*:\s*"([^"]+)"/)
          metaTitle = titleMatch?.[1] || result.split('\n')[0]?.replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim().slice(0, 60)
          metaDescription = descMatch?.[1] || result.split('\n').slice(1).join(' ').replace(/^.*?:\s*/, '').replace(/\*\*/g, '').trim().slice(0, 160)
        }
      } else if (isTitle) {
        metaTitle = result.replace(/\*\*/g, '').trim().slice(0, 60)
      } else {
        metaDescription = result.replace(/\*\*/g, '').trim().slice(0, 160)
      }
    } catch (aiError) {
      console.error('AI SEO generation failed, using fallback:', aiError)
      metaTitle = `${storeName} - Premium Online Store`
      metaDescription = `Shop the best products at ${storeName}. Quality items, great prices, and fast delivery. Browse our curated collection today.`
    }

    // Ensure fallbacks
    if (!metaTitle) metaTitle = `${storeName} - Online Store`
    if (!metaDescription) metaDescription = `Discover amazing products at ${storeName}. Shop now for great deals and fast shipping.`

    // Enforce character limits
    metaTitle = metaTitle.slice(0, 60)
    metaDescription = metaDescription.slice(0, 160)

    return NextResponse.json({ metaTitle, metaDescription })
  } catch (error) {
    console.error('SEO optimize error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
