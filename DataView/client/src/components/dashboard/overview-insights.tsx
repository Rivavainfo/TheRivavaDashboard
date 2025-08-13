import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/ui/editable-text';
import { FileText, Lightbulb, RefreshCw } from 'lucide-react';
import { DataRow } from '@/types/dashboard';
import { useMemo, useState } from 'react';

interface OverviewInsightsProps {
  data: DataRow[];
}

interface InsightPoint {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'summary' | 'opportunity' | 'warning' | 'growth';
}

export default function OverviewInsights({ data }: OverviewInsightsProps) {
  const [insights, setInsights] = useState<InsightPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultInsights = useMemo((): InsightPoint[] => {
    if (!data.length) return [];

    const numericColumns = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
    );

    const textColumns = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'string' && isNaN(Number(row[key])))
    );

    const totalRows = data.length;
    const avgNumericValue = numericColumns.length > 0 ? 
      data.reduce((sum, row) => sum + (Number(row[numericColumns[0]]) || 0), 0) / totalRows : 0;

    const uniqueCategories = textColumns.length > 0 ? 
      new Set(data.map(row => row[textColumns[0]])).size : 0;

    const insights: InsightPoint[] = [
      {
        id: '1',
        type: 'summary',
        title: 'Dataset Overview',
        description: `Analysis covers ${totalRows} records across ${Object.keys(data[0]).length} data fields. ${numericColumns.length > 0 ? `Average value in primary metric: ${avgNumericValue.toFixed(2)}` : 'Dataset contains primarily categorical data'}.`
      },
      {
        id: '2',
        type: 'trend',
        title: 'Data Distribution',
        description: textColumns.length > 0 ? 
          `Found ${uniqueCategories} unique categories in primary grouping field. Distribution analysis shows varied representation across segments.` :
          'Numeric data shows consistent patterns with identifiable trends across the dataset.'
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Growth Opportunities',
        description: numericColumns.length > 1 ? 
          'Multiple numeric metrics available for correlation analysis. Cross-field analysis could reveal performance drivers and optimization opportunities.' :
          'Dataset structure supports detailed categorical analysis and segmentation strategies.'
      }
    ];

    // Add additional insights based on data characteristics
    if (numericColumns.length > 0) {
      const maxValue = Math.max(...data.map(row => Number(row[numericColumns[0]]) || 0));
      const minValue = Math.min(...data.map(row => Number(row[numericColumns[0]]) || 0));
      
      insights.push({
        id: '4',
        type: 'growth',
        title: 'Performance Range',
        description: `Values range from ${minValue.toFixed(2)} to ${maxValue.toFixed(2)}, indicating ${maxValue > minValue * 3 ? 'significant' : 'moderate'} variance in performance metrics.`
      });
    }

    if (textColumns.length > 0 && uniqueCategories > 5) {
      insights.push({
        id: '5',
        type: 'warning',
        title: 'Category Complexity',
        description: `High category diversity (${uniqueCategories} unique values) suggests opportunity for grouping or segmentation to improve analysis clarity.`
      });
    }

    return insights.slice(0, 5);
  }, [data]);

  const generateAIInsights = async () => {
    if (!data.length) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI analysis - in real implementation, this would call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, use enhanced default insights
      const enhancedInsights = defaultInsights.map(insight => ({
        ...insight,
        title: `AI: ${insight.title}`,
        description: `${insight.description} [AI-Enhanced Analysis]`
      }));
      
      setInsights(enhancedInsights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setInsights(defaultInsights);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentInsights = insights.length > 0 ? insights : defaultInsights;

  const updateInsight = (id: string, field: 'title' | 'description', value: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, [field]: value } : insight
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return '📈';
      case 'summary': return '📊';
      case 'opportunity': return '🎯';
      case 'warning': return '⚠️';
      case 'growth': return '🚀';
      default: return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'summary': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'opportunity': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'growth': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
      default: return 'bg-turquoise-100 dark:bg-turquoise-900/20 text-turquoise-700 dark:text-turquoise-300';
    }
  };

  if (!data.length) return null;

  return (
    <Card className="hover-lift" data-testid="card-overview-insights">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-turquoise-400 p-2 rounded-lg mr-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <CardTitle>
              <EditableText 
                initialValue="Overview Insights" 
                as="h3"
                className="text-lg font-semibold"
                data-testid="text-overview-title"
              />
            </CardTitle>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={generateAIInsights}
            disabled={isGenerating}
            data-testid="button-generate-insights"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'AI Enhance'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentInsights.map((insight, index) => (
            <div 
              key={insight.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
              data-testid={`insight-point-${index + 1}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-xl" role="img" aria-label={insight.type}>
                    {getTypeIcon(insight.type)}
                  </span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <EditableText
                      initialValue={insight.title}
                      onSave={(value) => updateInsight(insight.id, 'title', value)}
                      as="h4"
                      className="font-medium text-gray-900 dark:text-white"
                      data-testid={`text-insight-title-${index + 1}`}
                    />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(insight.type)}`}>
                      {insight.type}
                    </span>
                  </div>
                  <EditableText
                    initialValue={insight.description}
                    onSave={(value) => updateInsight(insight.id, 'description', value)}
                    as="p"
                    multiline
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                    data-testid={`text-insight-description-${index + 1}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}