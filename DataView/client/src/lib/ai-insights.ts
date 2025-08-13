import { DataRow, AIInsight } from '@/types/dashboard';

export async function generateAIInsights(data: DataRow[]): Promise<AIInsight[]> {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI insights');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    // Fallback to basic statistical insights
    return generateBasicInsights(data);
  }
}

function generateBasicInsights(data: DataRow[]): AIInsight[] {
  if (!data.length) return [];

  const insights: AIInsight[] = [];
  const numericColumns = Object.keys(data[0]).filter(key => 
    data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  );

  // Trend analysis
  if (numericColumns.length > 0) {
    const firstCol = numericColumns[0];
    const values = data.map(row => Number(row[firstCol]) || 0);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    const trendDirection = trend > average ? 'upward' : 'downward';
    const trendPercentage = Math.abs(((trend - average) / average) * 100).toFixed(1);

    insights.push({
      id: 'trend-1',
      type: 'trend',
      title: 'Trend Detection',
      description: `${firstCol} shows ${trendDirection} trend with ${trendPercentage}% deviation from average.`,
      confidence: 0.85,
      icon: '📈'
    });
  }

  // Anomaly detection
  const textColumns = Object.keys(data[0]).filter(key => 
    data.some(row => typeof row[key] === 'string' && isNaN(Number(row[key])))
  );

  if (textColumns.length > 0) {
    const categories = data.reduce((acc, row) => {
      const category = row[textColumns[0]];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCategory = Object.entries(categories).reduce((a, b) => 
      categories[a[0]] > categories[b[0]] ? a : b
    );

    insights.push({
      id: 'anomaly-1',
      type: 'anomaly',
      title: 'Category Distribution',
      description: `${maxCategory[0]} represents ${((maxCategory[1] / data.length) * 100).toFixed(1)}% of all records - consider analyzing this concentration.`,
      confidence: 0.75,
      icon: '🎯'
    });
  }

  // Recommendation
  insights.push({
    id: 'recommendation-1',
    type: 'recommendation',
    title: 'Data Quality',
    description: `Dataset contains ${data.length} records across ${Object.keys(data[0]).length} dimensions. Consider adding time-series data for better trend analysis.`,
    confidence: 0.90,
    icon: '💡'
  });

  return insights;
}
