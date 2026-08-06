import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const apiKey = process.env.SHOPIFY_ADMIN_API_KEY;
    const apiPassword = process.env.SHOPIFY_ADMIN_API_PASSWORD;

    console.log('🧪 Testing Shopify connection...');
    console.log('Store Domain:', storeDomain);
    console.log('API Key exists:', !!apiKey);
    console.log('API Password exists:', !!apiPassword);

    if (!storeDomain || !apiKey || !apiPassword) {
      return NextResponse.json({
        error: 'Missing Shopify credentials',
        details: {
          storeDomain: storeDomain ? '✅' : '❌ Missing',
          apiKey: apiKey ? '✅' : '❌ Missing',
          apiPassword: apiPassword ? '✅' : '❌ Missing',
        },
      }, { status: 400 });
    }

    // Test REST API connection with Basic Auth
    const url = `https://${storeDomain}/admin/api/2024-01/shop.json`;
    const auth = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');

    console.log('🔗 Connecting to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Shopify API Error:', response.status, data);
      return NextResponse.json({
        error: `Shopify API Error: ${response.status}`,
        status: response.status,
        message: data.errors || data.error || 'Unknown error',
        details: data,
      }, { status: response.status });
    }

    console.log('✅ Shopify connection successful!');
    return NextResponse.json({
      success: true,
      message: 'Connected to Shopify successfully! 🎉',
      shop: data.shop,
      nextSteps: 'You can now run the synchronization to import customers and orders',
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json(
      {
        error: 'Connection test failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
