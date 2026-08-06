import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sourcingAgent } from '@/lib/sourcing-agent';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all products from orders
    const orderItems = await prisma.orderItem.findMany({
      distinct: ['productId'],
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    const products = orderItems.map(item => ({
      id: item.productId,
      name: item.productName,
      price: item.price,
      inventory: Math.floor(Math.random() * 100),
      monthlyVolume: Math.floor(Math.random() * 50) + 10,
      category: 'Pet Supplies'
    }));

    if (products.length === 0) {
      return NextResponse.json({
        error: 'No products found to analyze',
        message: 'Please ensure you have orders in the system'
      }, { status: 400 });
    }

    // Run sourcing analysis
    const analysis = await sourcingAgent.analyzeProducts(products);

    // Save analysis
    const analysisId = await sourcingAgent.saveAnalysis({
      type: 'product_analysis',
      data: { products, analysis },
      insights: analysis.insights,
      recommendations: analysis.recommendations
    });

    return NextResponse.json({
      success: true,
      analysisId,
      analysis,
      message: `Analysis completed for ${products.length} products`,
      stats: {
        productsAnalyzed: products.length,
        recommendationsFound: analysis.recommendations.length,
        opportunitiesFound: analysis.opportunitiesFound
      }
    });

  } catch (error) {
    console.error('Sourcing agent error:', error);
    return NextResponse.json(
      { error: 'Failed to run sourcing agent', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get latest analyses
    const analyses = await prisma.sourcingAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        recommendations: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      analyses,
      count: analyses.length
    });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
