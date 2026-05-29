import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let sdkInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getSdk() {
  if (!sdkInstance) {
    sdkInstance = await ZAI.create()
  }
  return sdkInstance
}

const fallbackDescriptions: Record<string, string> = {
  default: 'This premium product combines exceptional quality with outstanding value. Crafted with care and designed to exceed your expectations, it features durable materials and thoughtful design details that make it a standout choice. Perfect for everyday use or as a thoughtful gift.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, category, features } = body

    if (!productName) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      )
    }

    const categoryStr = category || 'general'
    const featuresStr = features ? ` Key features: ${features}.` : ''

    let description = ''

    try {
      const sdk = await getSdk()
      const response = await sdk.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a product description writer for an ecommerce store. Write engaging, SEO-friendly product descriptions. Keep descriptions under 200 words. Use bullet points for key features. Do not include any preamble like "Here is a description" - just write the description directly.',
          },
          {
            role: 'user',
            content: `Write a product description for: ${productName} in the ${categoryStr} category.${featuresStr}`,
          },
        ],
        thinking: { type: 'disabled' },
      })

      description = response.choices?.[0]?.message?.content || ''
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError)
      description = `**${productName}**\n\n${fallbackDescriptions.default}\n\n• Premium quality materials\n• Designed for lasting performance\n• Exceptional value for money\n• Perfect for everyday use`
    }

    if (!description) {
      description = `**${productName}**\n\n${fallbackDescriptions.default}\n\n• Premium quality materials\n• Designed for lasting performance\n• Exceptional value for money\n• Perfect for everyday use`
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Generate description error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
