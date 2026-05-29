import { NextRequest, NextResponse } from 'next/server'

// Mock comparison product data
const comparisonProducts: Record<string, {
  id: string
  name: string
  price: number
  salePrice?: number
  rating: number
  reviewCount: number
  availability: 'in-stock' | 'low-stock' | 'out-of-stock'
  category: string
  brand: string
  image: string
  features: string[]
  specs: { dimensions: string; weight: string; material: string }
  shipping: ('free' | 'standard' | 'express')[]
  returnPolicy: string
}> = {
  '1': {
    id: '1',
    name: 'Pro Wireless Headphones',
    price: 299.99,
    salePrice: 249.99,
    rating: 4.8,
    reviewCount: 2341,
    availability: 'in-stock',
    category: 'Audio',
    brand: 'SoundMax',
    image: '/products/headphones.png',
    features: ['Active Noise Cancellation', '40hr Battery Life', 'Bluetooth 5.3', 'Hi-Res Audio', 'Multipoint Connection'],
    specs: { dimensions: '7.5 x 6.8 x 3.2 in', weight: '250g', material: 'Premium Aluminum + Protein Leather' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
  '2': {
    id: '2',
    name: 'Mechanical Gaming Keyboard',
    price: 179.99,
    rating: 4.6,
    reviewCount: 1892,
    availability: 'in-stock',
    category: 'Peripherals',
    brand: 'KeyForge',
    image: '/products/keyboard.png',
    features: ['Cherry MX Switches', 'RGB Backlighting', 'USB-C Connection', 'N-Key Rollover', 'Detachable Wrist Rest'],
    specs: { dimensions: '17.5 x 5.5 x 1.5 in', weight: '980g', material: 'Aircraft-grade Aluminum' },
    shipping: ['free', 'standard'],
    returnPolicy: '30-Day Free Returns',
  },
  '3': {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 349.99,
    salePrice: 299.99,
    rating: 4.7,
    reviewCount: 3102,
    availability: 'low-stock',
    category: 'Wearables',
    brand: 'FitTech',
    image: '/products/smartwatch.png',
    features: ['Heart Rate Monitor', 'GPS Tracking', '7-Day Battery', 'Water Resistant 50m', 'AMOLED Display'],
    specs: { dimensions: '1.8 x 1.8 x 0.5 in', weight: '52g', material: 'Titanium + Sapphire Glass' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '15-Day Free Returns',
  },
  '4': {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    price: 129.99,
    rating: 4.5,
    reviewCount: 987,
    availability: 'in-stock',
    category: 'Audio',
    brand: 'BoomBox',
    image: '/products/speaker.png',
    features: ['360° Sound', 'IPX7 Waterproof', '24hr Battery', 'Stereo Pairing', 'Built-in Microphone'],
    specs: { dimensions: '3.5 x 3.5 x 7.0 in', weight: '680g', material: 'Rugged Rubber + Fabric' },
    shipping: ['standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
  '5': {
    id: '5',
    name: 'Premium Phone Case',
    price: 49.99,
    rating: 4.3,
    reviewCount: 5643,
    availability: 'in-stock',
    category: 'Accessories',
    brand: 'ShieldPro',
    image: '/products/phonecase.png',
    features: ['Military Drop Protection', 'MagSafe Compatible', 'Anti-Yellowing', 'Wireless Charging', 'Slim Profile'],
    specs: { dimensions: '6.3 x 3.1 x 0.5 in', weight: '35g', material: 'Polycarbonate + TPU' },
    shipping: ['free', 'standard'],
    returnPolicy: '60-Day Free Returns',
  },
  '6': {
    id: '6',
    name: 'USB-C Charging Dock',
    price: 89.99,
    salePrice: 74.99,
    rating: 4.4,
    reviewCount: 432,
    availability: 'out-of-stock',
    category: 'Accessories',
    brand: 'ChargeHub',
    image: '/products/dock.png',
    features: ['100W Power Delivery', 'Triple Display', '12-in-1 Hub', 'Ethernet Port', 'SD Card Reader'],
    specs: { dimensions: '4.5 x 3.0 x 1.2 in', weight: '210g', material: 'Anodized Aluminum' },
    shipping: ['standard'],
    returnPolicy: '30-Day Free Returns',
  },
  '7': {
    id: '7',
    name: 'Ergonomic Office Chair',
    price: 599.99,
    salePrice: 499.99,
    rating: 4.9,
    reviewCount: 756,
    availability: 'low-stock',
    category: 'Furniture',
    brand: 'ErgoMax',
    image: '',
    features: ['Lumbar Support', 'Adjustable Armrests', 'Mesh Back', 'Tilt Lock', 'Headrest Included'],
    specs: { dimensions: '27 x 27 x 48 in', weight: '45lbs', material: 'Breathable Mesh + Steel Frame' },
    shipping: ['free'],
    returnPolicy: '60-Day Free Returns',
  },
  '8': {
    id: '8',
    name: '4K Webcam Pro',
    price: 199.99,
    rating: 4.6,
    reviewCount: 1123,
    availability: 'in-stock',
    category: 'Peripherals',
    brand: 'ClearView',
    image: '',
    features: ['4K Ultra HD', 'Auto Focus', 'Noise Cancelling Mic', 'Privacy Cover', 'Low Light Correction'],
    specs: { dimensions: '4.0 x 2.2 x 2.0 in', weight: '140g', material: 'Premium Plastic + Glass Lens' },
    shipping: ['free', 'standard', 'express'],
    returnPolicy: '30-Day Free Returns',
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ids = searchParams.get('ids')

  if (!ids) {
    // Return all available products for search/autocomplete
    return NextResponse.json({
      products: Object.values(comparisonProducts),
    })
  }

  const idList = ids.split(',').filter(Boolean)
  const products = idList
    .map((id) => comparisonProducts[id])
    .filter(Boolean)

  return NextResponse.json({
    products,
    count: products.length,
  })
}
