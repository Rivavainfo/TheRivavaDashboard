import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface DataRow {
  [key: string]: any;
}

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  icon: string;
}

export async function generateAIInsights(data: DataRow[]): Promise<AIInsight[]> {
  try {
    if (!data || data.length === 0) {
      return [];
    }

    // Prepare data summary for AI analysis
    const dataSummary = {
      totalRecords: data.length,
      columns: Object.keys(data[0] || {}),
      sampleData: data.slice(0, 5), // First 5 rows as sample
      statistics: generateBasicStatistics(data)
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert data analyst. Analyze the provided dataset and generate actionable insights. 
          Focus on identifying trends, anomalies, and recommendations. 
          Respond with JSON in this exact format: {
            "insights": [
              {
                "type": "trend|anomaly|recommendation",
                "title": "Short descriptive title",
                "description": "Detailed insight description (max 150 chars)",
                "confidence": 0.85
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Analyze this dataset and provide 3-5 key insights:\n${JSON.stringify(dataSummary, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    
    return result.insights.map((insight: any, index: number) => ({
      id: `ai-insight-${index + 1}`,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence: Math.min(Math.max(insight.confidence || 0.5, 0), 1),
      icon: getInsightIcon(insight.type)
    }));
    
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback to basic insights if AI fails
    return generateFallbackInsights(data);
  }
}

function generateBasicStatistics(data: DataRow[]) {
  const numericColumns = Object.keys(data[0] || {}).filter(key => 
    data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  );

  const stats: any = {};
  
  numericColumns.forEach(col => {
    const values = data.map(row => Number(row[col]) || 0).filter(v => !isNaN(v));
    if (values.length > 0) {
      stats[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        total: values.reduce((a, b) => a + b, 0)
      };
    }
  });

  return stats;
}

function generateFallbackInsights(data: DataRow[]): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (data.length === 0) return insights;

  const numericColumns = Object.keys(data[0]).filter(key => 
    data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  );

  // Trend insight
  if (numericColumns.length > 0) {
    const firstCol = numericColumns[0];
    const values = data.map(row => Number(row[firstCol]) || 0);
    const recentAvg = values.slice(-Math.min(5, values.length)).reduce((a, b) => a + b, 0) / Math.min(5, values.length);
    const overallAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const change = ((recentAvg - overallAvg) / overallAvg * 100);

    insights.push({
      id: 'fallback-trend-1',
      type: 'trend',
      title: 'Data Trend Analysis',
      description: `Recent ${firstCol} values show ${change > 0 ? 'positive' : 'negative'} trend of ${Math.abs(change).toFixed(1)}% vs overall average.`,
      confidence: 0.75,
      icon: '📈'
    });
  }

  // Anomaly insight
  const textColumns = Object.keys(data[0]).filter(key => 
    data.some(row => typeof row[key] === 'string' && isNaN(Number(row[key])))
  );

  if (textColumns.length > 0) {
    const categories = data.reduce((acc, row) => {
      const cat = row[textColumns[0]];
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categories).sort(([,a], [,b]) => b - a);
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      const percentage = (topCategory[1] / data.length * 100).toFixed(1);
      
      insights.push({
        id: 'fallback-anomaly-1',
        type: 'anomaly',
        title: 'Distribution Pattern',
        description: `${topCategory[0]} dominates with ${percentage}% of records. Consider investigating this concentration.`,
        confidence: 0.80,
        icon: '🎯'
      });
    }
  }

  // Recommendation
  insights.push({
    id: 'fallback-recommendation-1',
    type: 'recommendation',
    title: 'Data Enhancement',
    description: `Dataset has ${data.length} records with ${Object.keys(data[0]).length} fields. Consider adding timestamp data for temporal analysis.`,
    confidence: 0.85,
    icon: '💡'
  });

  return insights;
}

function getInsightIcon(type: string): string {
  switch (type) {
    case 'trend': return '📈';
    case 'anomaly': return '🎯';
    case 'recommendation': return '💡';
    default: return '📊';
  }
}
