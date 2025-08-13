import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EditableText from '@/components/ui/editable-text';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { DataRow, KPIMetric } from '@/types/dashboard';

interface KPICardsProps {
  data: DataRow[];
}

export default function KPICards({ data }: KPICardsProps) {
  const metrics = useMemo(() => {
    if (!data.length) return [];

    const numericColumns = Object.keys(data[0]).filter(key => {
      return data.some(row => typeof row[key] === 'number' || !isNaN(Number(row[key])));
    });

    const kpis: KPIMetric[] = [];

    // Total Revenue (assuming there's a revenue/sales/amount column)
    const revenueColumn = numericColumns.find(col => 
      col.toLowerCase().includes('revenue') || 
      col.toLowerCase().includes('sales') || 
      col.toLowerCase().includes('amount') ||
      col.toLowerCase().includes('total')
    );

    if (revenueColumn) {
      const totalRevenue = data.reduce((sum, row) => sum + (Number(row[revenueColumn]) || 0), 0);
      kpis.push({
        id: 'revenue',
        label: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        trend: 12.5,
        trendDirection: 'up',
        icon: 'dollar',
        color: 'turquoise'
      });
    }

    // Total Records (Active Users)
    kpis.push({
      id: 'users',
      label: 'Total Records',
      value: data.length.toLocaleString(),
      trend: 18.2,
      trendDirection: 'up',
      icon: 'users',
      color: 'blue'
    });

    // Average Value
    if (numericColumns.length > 0) {
      const avgColumn = numericColumns[0];
      const average = data.reduce((sum, row) => sum + (Number(row[avgColumn]) || 0), 0) / data.length;
      kpis.push({
        id: 'average',
        label: `Avg ${avgColumn}`,
        value: average.toFixed(2),
        trend: -2.1,
        trendDirection: 'down',
        icon: 'trending',
        color: 'green'
      });
    }

    // Count of unique values in first text column
    const textColumns = Object.keys(data[0]).filter(key => 
      data.some(row => typeof row[key] === 'string' && isNaN(Number(row[key])))
    );

    if (textColumns.length > 0) {
      const uniqueValues = new Set(data.map(row => row[textColumns[0]])).size;
      kpis.push({
        id: 'categories',
        label: `Unique ${textColumns[0]}`,
        value: uniqueValues.toString(),
        trend: 5.4,
        trendDirection: 'up',
        icon: 'cart',
        color: 'purple'
      });
    }

    return kpis;
  }, [data]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'dollar': return DollarSign;
      case 'users': return Users;
      case 'trending': return TrendingUp;
      case 'cart': return ShoppingCart;
      default: return TrendingUp;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'turquoise': return 'bg-turquoise-100 dark:bg-turquoise-900 text-turquoise-600 dark:text-turquoise-400';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
      case 'green': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      default: return 'bg-turquoise-100 dark:bg-turquoise-900 text-turquoise-600 dark:text-turquoise-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const IconComponent = getIcon(metric.icon);
        return (
          <Card key={metric.id} className="hover-lift" data-testid={`card-kpi-${metric.id}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <EditableText
                    initialValue={metric.label}
                    as="p"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                    data-testid={`text-kpi-label-${metric.id}`}
                  />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`text-kpi-value-${metric.id}`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium flex items-center ${
                  metric.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
                }`} data-testid={`text-kpi-trend-${metric.id}`}>
                  {metric.trendDirection === 'up' ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {metric.trendDirection === 'up' ? '+' : ''}{metric.trend}%
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
