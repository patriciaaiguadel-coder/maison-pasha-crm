import { prisma } from './prisma';
import { Anthropic } from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY not found in environment variables');
}

const client = new Anthropic({
  apiKey: apiKey || 'sk-placeholder',
});

export interface AnalysisResult {
  type: string;
  insights: string[];
  recommendations: RecommendationData[];
  opportunitiesFound: number;
}

export interface RecommendationData {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  estimatedSavings?: number;
  confidence: number;
  actionItems: string[];
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  cost?: number;
  inventory: number;
  monthlyVolume: number;
  category: string;
}

export class SourcingAgent {
  async analyzeProducts(products: ProductData[]): Promise<AnalysisResult> {
    const prompt = this.buildProductAnalysisPrompt(products);

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return this.parseAnalysisResponse(message.content[0]);
  }

  async detectTrends(orderHistory: any[]): Promise<AnalysisResult> {
    const prompt = this.buildTrendAnalysisPrompt(orderHistory);

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return this.parseAnalysisResponse(message.content[0]);
  }

  async findSupplierOpportunities(productId: string, productData: ProductData): Promise<any[]> {
    const prompt = `
    Analyze this product and identify potential supplier opportunities:

    Product: ${productData.name}
    Current Price: ${productData.price}
    Cost: ${productData.cost || 'Unknown'}
    Monthly Volume: ${productData.monthlyVolume}
    Category: ${productData.category}

    For this product, suggest:
    1. Alternative suppliers or sourcing strategies
    2. Estimated cost reductions
    3. Quality and reliability considerations
    4. Minimum order quantities and lead times

    Format as JSON with: supplierName, estimatedPricePerUnit, estimatedSavings, leadTime, minOrder, quality, reliability, notes
    `;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return this.parseSupplierResponse(message.content[0]);
  }

  async generateReport(analysisIds: string[]): Promise<string> {
    const analyses = await prisma.sourcingAnalysis.findMany({
      where: { id: { in: analysisIds } },
      include: { recommendations: true }
    });

    const prompt = `
    Generate an executive summary report from these sourcing analyses:

    ${analyses.map(a => `
    Analysis Type: ${a.type}
    Insights: ${a.insights.join(', ')}
    Recommendations: ${a.recommendations.map(r => r.title).join(', ')}
    `).join('\n')}

    Create a concise, actionable report with:
    1. Key findings
    2. Top opportunities
    3. Recommended actions
    4. Estimated financial impact
    `;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return this.extractTextContent(message.content[0]);
  }

  private buildProductAnalysisPrompt(products: ProductData[]): string {
    return `
    Analyze these products for sourcing optimization opportunities:

    ${products.map(p => `
    - ${p.name}: Price ${p.price}, Cost ${p.cost || 'Unknown'}, Monthly Volume ${p.monthlyVolume}, Inventory ${p.inventory}
    `).join('\n')}

    Provide analysis in JSON format with:
    {
      "insights": ["insight1", "insight2", ...],
      "recommendations": [
        {
          "title": "...",
          "description": "...",
          "priority": "HIGH|MEDIUM|LOW",
          "type": "supplier_switch|cost_optimization|volume_increase",
          "estimatedSavings": number,
          "confidence": 0-100,
          "actionItems": ["action1", "action2"]
        }
      ]
    }
    `;
  }

  private buildTrendAnalysisPrompt(orderHistory: any[]): string {
    return `
    Analyze these sales trends to identify sourcing opportunities:

    Orders: ${JSON.stringify(orderHistory, null, 2)}

    Identify patterns and provide recommendations in JSON format with:
    {
      "insights": ["insight1", "insight2", ...],
      "recommendations": [...]
    }
    `;
  }

  private parseAnalysisResponse(content: any): AnalysisResult {
    try {
      const text = content.type === 'text' ? content.text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          type: 'analysis',
          insights: [text],
          recommendations: [],
          opportunitiesFound: 0
        };
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type: 'analysis',
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        opportunitiesFound: parsed.recommendations?.length || 0
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return {
        type: 'analysis',
        insights: [],
        recommendations: [],
        opportunitiesFound: 0
      };
    }
  }

  private parseSupplierResponse(content: any): any[] {
    try {
      const text = content.type === 'text' ? content.text : '';
      const jsonMatches = text.match(/\{[\s\S]*?\}/g) || [];
      return jsonMatches.map((json: string) => JSON.parse(json));
    } catch (error) {
      console.error('Error parsing supplier response:', error);
      return [];
    }
  }

  private extractTextContent(content: any): string {
    return content.type === 'text' ? content.text : '';
  }

  async saveAnalysis(analysisData: any): Promise<string> {
    const analysis = await prisma.sourcingAnalysis.create({
      data: {
        type: analysisData.type || 'product_analysis',
        analysisData: analysisData.data || {},
        insights: analysisData.insights || [],
        status: 'completed'
      }
    });

    if (analysisData.recommendations && analysisData.recommendations.length > 0) {
      await prisma.sourcingRecommendation.createMany({
        data: analysisData.recommendations.map((rec: RecommendationData) => ({
          analysisId: analysis.id,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          type: rec.type,
          estimatedSavings: rec.estimatedSavings,
          confidence: rec.confidence,
          actionItems: rec.actionItems || []
        }))
      });
    }

    return analysis.id;
  }
}

export const sourcingAgent = new SourcingAgent();
