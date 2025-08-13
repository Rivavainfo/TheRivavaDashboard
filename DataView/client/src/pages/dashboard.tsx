import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/ui/editable-text';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, BarChart3 } from 'lucide-react';
import DataSourceSelector from '@/components/dashboard/data-source-selector';
import KPICards from '@/components/dashboard/kpi-cards';
import Charts from '@/components/dashboard/charts';
import AIInsights from '@/components/dashboard/ai-insights';
import DataTable from '@/components/dashboard/data-table';
import ExportMenu from '@/components/dashboard/export-menu';
import { DataSource, DataRow } from '@/types/dashboard';

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: aiInsights } = useQuery<any[]>({
    queryKey: ['/api/ai-insights', dataSource?.data],
    enabled: !!dataSource?.data?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDataSourceUpdate = (newDataSource: DataSource) => {
    setDataSource(newDataSource);
  };

  const handleLoadingStateChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-turquoise-400 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <EditableText 
                initialValue="DataViz Pro" 
                as="h1" 
                className="text-xl font-semibold text-gray-900 dark:text-white"
              />
              <span className="bg-turquoise-100 dark:bg-turquoise-900 text-turquoise-700 dark:text-turquoise-300 px-2 py-1 rounded-full text-xs font-medium">
                Beta
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              <ExportMenu data={dataSource?.data || []} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Data Source Selection */}
          <DataSourceSelector 
            onDataSourceUpdate={handleDataSourceUpdate}
            onLoadingChange={handleLoadingStateChange}
          />

          {/* Dashboard Content */}
          {dataSource?.data?.length ? (
            <div className="space-y-8 animate-fade-in">
              <KPICards data={dataSource.data} />
              
              {aiInsights && Array.isArray(aiInsights) && <AIInsights insights={aiInsights} />}
              
              <Charts data={dataSource.data} />
              
              <DataTable data={dataSource.data} />
            </div>
          ) : !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-gray-600 dark:text-gray-400 mb-2">
                  No Data Connected
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload a CSV file or connect to Firebase to get started with your analytics dashboard.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <Card className="p-8 text-center">
              <CardContent>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
