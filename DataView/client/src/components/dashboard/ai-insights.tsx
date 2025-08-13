import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EditableText from '@/components/ui/editable-text';
import { Zap, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { AIInsight } from '@/types/dashboard';

interface AIInsightsProps {
  insights: AIInsight[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return TrendingUp;
    }
  };

  const getEmoji = (type: string) => {
    switch (type) {
      case 'trend': return '📈';
      case 'anomaly': return '🎯';
      case 'recommendation': return '💡';
      default: return '📊';
    }
  };

  if (!insights?.length) return null;

  return (
    <Card className="bg-gradient-to-r from-turquoise-50 to-turquoise-100 dark:from-turquoise-900/20 dark:to-turquoise-800/20 border-turquoise-200 dark:border-turquoise-700" data-testid="card-ai-insights">
      <CardHeader>
        <div className="flex items-center mb-4">
          <div className="bg-turquoise-400 p-2 rounded-lg mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <CardTitle>
            <EditableText 
              initialValue="AI-Powered Insights" 
              as="h3" 
              className="text-lg font-semibold text-gray-900 dark:text-white" 
            />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {insights.slice(0, 3).map((insight) => (
            <Card key={insight.id} className="bg-white dark:bg-gray-800" data-testid={`card-insight-${insight.type}`}>
              <CardContent className="p-4">
                <div className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="mr-2">{getEmoji(insight.type)}</span>
                  <EditableText
                    initialValue={insight.title}
                    as="h4"
                    className="font-medium text-gray-900 dark:text-white"
                  />
                </div>
                <EditableText
                  initialValue={insight.description}
                  as="p"
                  multiline
                  className="text-sm text-gray-600 dark:text-gray-400 mb-2"
                  data-testid={`text-insight-description-${insight.type}`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </span>
                  <div className="w-2 h-2 bg-turquoise-400 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
